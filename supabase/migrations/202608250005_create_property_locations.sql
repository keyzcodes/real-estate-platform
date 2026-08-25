begin;

create table public.property_locations (
    property_id uuid primary key
        references public.properties(id) on delete cascade,

    street_address text not null,
    postal_code varchar(20),

    exact_latitude numeric(9, 6) not null,
    exact_longitude numeric(9, 6) not null,

    approximate_latitude numeric(9, 3)
        generated always as (
            round(exact_latitude, 3)
        ) stored,

    approximate_longitude numeric(9, 3)
        generated always as (
            round(exact_longitude, 3)
        ) stored,

    location_source varchar(20) not null,
    accuracy_meters numeric(8, 2),

    captured_at timestamptz,
    verified_at timestamptz,
    verified_by uuid
        references public.profiles(id) on delete set null,

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),

    constraint property_locations_address_not_blank
        check (char_length(trim(street_address)) > 0),

    constraint property_locations_latitude_valid
        check (
            exact_latitude between -90 and 90
        ),

    constraint property_locations_longitude_valid
        check (
            exact_longitude between -180 and 180
        ),

    constraint property_locations_source_allowed
        check (
            location_source in (
                'device_gps',
                'map_selection',
                'geocoded',
                'manual'
            )
        ),

    constraint property_locations_accuracy_valid
        check (
            accuracy_meters is null
            or accuracy_meters >= 0
        )
);

create trigger property_locations_set_updated_at
before update on public.property_locations
for each row
execute function public.set_updated_at();

alter table public.property_locations enable row level security;

revoke all on table public.property_locations
from anon, authenticated;

commit;