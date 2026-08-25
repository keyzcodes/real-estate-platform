begin;

create table public.amenities (
    id uuid primary key default gen_random_uuid(),

    name varchar(100) not null,
    slug varchar(100) not null unique,
    category varchar(30) not null,
    description text,
    allowed_scope varchar(20) not null,

    is_active boolean not null default true,

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),

    constraint amenities_name_not_blank
        check (char_length(trim(name)) > 0),

    constraint amenities_slug_format
        check (
            slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'
        ),

    constraint amenities_category_allowed
        check (
            category in (
                'utilities',
                'security',
                'comfort',
                'accessibility',
                'parking',
                'shared_facilities',
                'connectivity'
            )
        ),

    constraint amenities_scope_allowed
        check (
            allowed_scope in (
                'property',
                'unit',
                'both'
            )
        )
);

create unique index amenities_name_case_insensitive_idx
    on public.amenities(lower(name));

create table public.property_amenities (
    property_id uuid not null
        references public.properties(id) on delete cascade,

    amenity_id uuid not null
        references public.amenities(id) on delete cascade,

    details varchar(250),
    created_at timestamptz not null default now(),

    constraint property_amenities_primary_key
        primary key (property_id, amenity_id)
);

create table public.unit_amenities (
    unit_id uuid not null
        references public.property_units(id) on delete cascade,

    amenity_id uuid not null
        references public.amenities(id) on delete cascade,

    details varchar(250),
    created_at timestamptz not null default now(),

    constraint unit_amenities_primary_key
        primary key (unit_id, amenity_id)
);

create index property_amenities_amenity_idx
    on public.property_amenities(amenity_id);

create index unit_amenities_amenity_idx
    on public.unit_amenities(amenity_id);

create function public.validate_property_amenity_scope()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
    if not exists (
        select 1
        from public.amenities
        where id = new.amenity_id
          and allowed_scope in ('property', 'both')
          and is_active = true
    ) then
        raise exception
            'Amenity cannot be assigned at property level'
            using errcode = '23514';
    end if;

    return new;
end;
$$;

create function public.validate_unit_amenity_scope()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
    if not exists (
        select 1
        from public.amenities
        where id = new.amenity_id
          and allowed_scope in ('unit', 'both')
          and is_active = true
    ) then
        raise exception
            'Amenity cannot be assigned at unit level'
            using errcode = '23514';
    end if;

    return new;
end;
$$;

create trigger property_amenities_validate_scope
before insert or update of amenity_id
on public.property_amenities
for each row
execute function public.validate_property_amenity_scope();

create trigger unit_amenities_validate_scope
before insert or update of amenity_id
on public.unit_amenities
for each row
execute function public.validate_unit_amenity_scope();

create trigger amenities_set_updated_at
before update on public.amenities
for each row
execute function public.set_updated_at();

revoke execute
on function public.validate_property_amenity_scope()
from public, anon, authenticated;

revoke execute
on function public.validate_unit_amenity_scope()
from public, anon, authenticated;

alter table public.amenities enable row level security;
alter table public.property_amenities enable row level security;
alter table public.unit_amenities enable row level security;

revoke all on table public.amenities
from anon, authenticated;

revoke all on table public.property_amenities
from anon, authenticated;

revoke all on table public.unit_amenities
from anon, authenticated;

commit;