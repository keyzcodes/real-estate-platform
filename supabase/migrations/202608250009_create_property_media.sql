begin;

create table public.property_media (
    id uuid primary key default gen_random_uuid(),

    property_id uuid not null
        references public.properties(id) on delete cascade,

    unit_id uuid
        references public.property_units(id) on delete cascade,

    uploaded_by uuid
        references public.profiles(id) on delete set null,

    media_type varchar(20) not null,
    media_category varchar(30) not null,

    storage_provider varchar(30) not null default 'cloudinary',
    storage_key text not null unique,

    format varchar(20) not null,
    file_size_bytes bigint not null,
    width_pixels integer,
    height_pixels integer,
    duration_seconds numeric(8, 2),

    alt_text varchar(200) not null,
    display_order smallint not null default 0,
    is_cover boolean not null default false,

    verification_status varchar(20) not null default 'pending',
    rejection_reason text,

    captured_at timestamptz,
    verified_at timestamptz,
    verified_by uuid
        references public.profiles(id) on delete set null,

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),

    constraint property_media_type_allowed
        check (
            media_type in (
                'image',
                'video',
                'panorama'
            )
        ),

    constraint property_media_category_allowed
        check (
            media_category in (
                'exterior',
                'entrance',
                'interior',
                'bedroom',
                'bathroom',
                'kitchen',
                'facility',
                'neighbourhood',
                'floor_plan',
                'other'
            )
        ),

    constraint property_media_provider_allowed
        check (
            storage_provider in (
                'cloudinary'
            )
        ),

    constraint property_media_format_not_blank
        check (char_length(trim(format)) > 0),

    constraint property_media_file_size_valid
        check (file_size_bytes > 0),

    constraint property_media_dimensions_valid
        check (
            (
                width_pixels is null
                and height_pixels is null
            )
            or (
                width_pixels > 0
                and height_pixels > 0
            )
        ),

    constraint property_media_video_duration_valid
        check (
            (
                media_type = 'video'
                and duration_seconds is not null
                and duration_seconds > 0
            )
            or (
                media_type <> 'video'
                and duration_seconds is null
            )
        ),

    constraint property_media_alt_text_not_blank
        check (char_length(trim(alt_text)) > 0),

    constraint property_media_display_order_valid
        check (display_order >= 0),

    constraint property_media_cover_must_be_image
        check (
            is_cover = false
            or (
                media_type = 'image'
                and unit_id is null
            )
        ),

    constraint property_media_verification_status_allowed
        check (
            verification_status in (
                'pending',
                'approved',
                'rejected'
            )
        ),

    constraint property_media_rejection_requires_reason
        check (
            verification_status <> 'rejected'
            or (
                rejection_reason is not null
                and char_length(trim(rejection_reason)) > 0
            )
        )
);

create unique index property_media_one_cover_per_property_idx
    on public.property_media(property_id)
    where is_cover = true;

create index property_media_property_gallery_idx
    on public.property_media (
        property_id,
        verification_status,
        display_order
    );

create index property_media_unit_idx
    on public.property_media(unit_id)
    where unit_id is not null;

create function public.validate_media_unit_property()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
    if new.unit_id is not null
       and not exists (
           select 1
           from public.property_units
           where id = new.unit_id
             and property_id = new.property_id
       )
    then
        raise exception
            'Selected unit does not belong to selected property'
            using errcode = '23514';
    end if;

    return new;
end;
$$;

create trigger property_media_validate_unit
before insert or update of property_id, unit_id
on public.property_media
for each row
execute function public.validate_media_unit_property();

create trigger property_media_set_updated_at
before update on public.property_media
for each row
execute function public.set_updated_at();

revoke execute
on function public.validate_media_unit_property()
from public, anon, authenticated;

alter table public.property_media enable row level security;

revoke all on table public.property_media
from anon, authenticated;

commit;