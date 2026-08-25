begin;

create table public.virtual_tours (
    id uuid primary key default gen_random_uuid(),

    property_id uuid not null
        references public.properties(id) on delete cascade,

    title varchar(150) not null,
    description text,

    review_status varchar(20) not null default 'draft',
    publication_status varchar(20) not null default 'draft',
    is_primary boolean not null default false,

    created_by uuid
        references public.profiles(id) on delete set null,

    reviewed_by uuid
        references public.profiles(id) on delete set null,

    reviewed_at timestamptz,
    rejection_reason text,

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),

    constraint virtual_tours_title_not_blank
        check (char_length(trim(title)) > 0),

    constraint virtual_tours_review_status_allowed
        check (
            review_status in (
                'draft',
                'submitted',
                'approved',
                'rejected'
            )
        ),

    constraint virtual_tours_publication_status_allowed
        check (
            publication_status in (
                'draft',
                'published',
                'archived'
            )
        ),

    constraint virtual_tours_publish_only_when_approved
        check (
            publication_status <> 'published'
            or review_status = 'approved'
        ),

    constraint virtual_tours_rejection_requires_reason
        check (
            review_status <> 'rejected'
            or (
                rejection_reason is not null
                and char_length(trim(rejection_reason)) > 0
            )
        ),

    constraint virtual_tours_approval_requires_reviewer
        check (
            review_status <> 'approved'
            or (
                reviewed_by is not null
                and reviewed_at is not null
            )
        )
);

create unique index virtual_tours_one_primary_per_property_idx
    on public.virtual_tours(property_id)
    where is_primary = true;

create index virtual_tours_property_status_idx
    on public.virtual_tours(
        property_id,
        review_status,
        publication_status
    );

create table public.tour_scenes (
    id uuid primary key default gen_random_uuid(),

    tour_id uuid not null
        references public.virtual_tours(id) on delete cascade,

    panorama_media_id uuid not null unique
        references public.property_media(id) on delete cascade,

    title varchar(100) not null,
    description text,

    initial_yaw numeric(6, 2) not null default 0,
    initial_pitch numeric(6, 2) not null default 0,
    initial_field_of_view numeric(6, 2) not null default 100,

    display_order smallint not null default 0,

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),

    constraint tour_scenes_title_not_blank
        check (char_length(trim(title)) > 0),

    constraint tour_scenes_yaw_valid
        check (initial_yaw between -180 and 180),

    constraint tour_scenes_pitch_valid
        check (initial_pitch between -90 and 90),

    constraint tour_scenes_field_of_view_valid
        check (
            initial_field_of_view between 30 and 120
        ),

    constraint tour_scenes_display_order_valid
        check (display_order >= 0)
);

create index tour_scenes_tour_order_idx
    on public.tour_scenes(tour_id, display_order);

create table public.tour_hotspots (
    id uuid primary key default gen_random_uuid(),

    from_scene_id uuid not null
        references public.tour_scenes(id) on delete cascade,

    target_scene_id uuid not null
        references public.tour_scenes(id) on delete cascade,

    label varchar(100) not null,
    yaw numeric(6, 2) not null,
    pitch numeric(6, 2) not null,

    created_at timestamptz not null default now(),

    constraint tour_hotspots_scenes_different
        check (from_scene_id <> target_scene_id),

    constraint tour_hotspots_label_not_blank
        check (char_length(trim(label)) > 0),

    constraint tour_hotspots_yaw_valid
        check (yaw between -180 and 180),

    constraint tour_hotspots_pitch_valid
        check (pitch between -90 and 90),

    constraint tour_hotspots_unique_connection
        unique (from_scene_id, target_scene_id)
);

create index tour_hotspots_target_scene_idx
    on public.tour_hotspots(target_scene_id);

create function public.validate_tour_scene_media()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
    if not exists (
        select 1
        from public.virtual_tours as tour
        join public.property_media as media
          on media.id = new.panorama_media_id
        where tour.id = new.tour_id
          and media.property_id = tour.property_id
          and media.media_type = 'panorama'
    ) then
        raise exception
            'Tour scene must use panorama media from the same property'
            using errcode = '23514';
    end if;

    return new;
end;
$$;

create function public.validate_tour_hotspot()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
    if not exists (
        select 1
        from public.tour_scenes as source
        join public.tour_scenes as target
          on target.id = new.target_scene_id
        where source.id = new.from_scene_id
          and source.tour_id = target.tour_id
    ) then
        raise exception
            'Hotspot scenes must belong to the same virtual tour'
            using errcode = '23514';
    end if;

    return new;
end;
$$;

create function public.validate_virtual_tour_publication()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
    if new.publication_status = 'published' then
        if not exists (
            select 1
            from public.tour_scenes
            where tour_id = new.id
        ) then
            raise exception
                'A virtual tour must contain at least one scene'
                using errcode = '23514';
        end if;

        if exists (
            select 1
            from public.tour_scenes as scene
            join public.property_media as media
              on media.id = scene.panorama_media_id
            where scene.tour_id = new.id
              and media.verification_status <> 'approved'
        ) then
            raise exception
                'Every panorama must be approved before publication'
                using errcode = '23514';
        end if;
    end if;

    return new;
end;
$$;

create trigger tour_scenes_validate_media
before insert or update of tour_id, panorama_media_id
on public.tour_scenes
for each row
execute function public.validate_tour_scene_media();

create trigger tour_hotspots_validate_connection
before insert or update of from_scene_id, target_scene_id
on public.tour_hotspots
for each row
execute function public.validate_tour_hotspot();

create trigger virtual_tours_validate_publication
before insert or update of publication_status
on public.virtual_tours
for each row
execute function public.validate_virtual_tour_publication();

create trigger virtual_tours_set_updated_at
before update on public.virtual_tours
for each row
execute function public.set_updated_at();

create trigger tour_scenes_set_updated_at
before update on public.tour_scenes
for each row
execute function public.set_updated_at();

revoke execute
on function public.validate_tour_scene_media()
from public, anon, authenticated;

revoke execute
on function public.validate_tour_hotspot()
from public, anon, authenticated;

revoke execute
on function public.validate_virtual_tour_publication()
from public, anon, authenticated;

alter table public.virtual_tours enable row level security;
alter table public.tour_scenes enable row level security;
alter table public.tour_hotspots enable row level security;

revoke all on table public.virtual_tours
from anon, authenticated;

revoke all on table public.tour_scenes
from anon, authenticated;

revoke all on table public.tour_hotspots
from anon, authenticated;

commit;