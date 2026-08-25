begin;

create table public.property_units (
    id uuid primary key default gen_random_uuid(),

    property_id uuid not null
        references public.properties(id) on delete cascade,

    unit_name varchar(100) not null,
    unit_type varchar(30) not null,
    description text,

    bedrooms smallint not null default 0,
    bathrooms smallint not null default 0,
    maximum_occupants smallint not null default 1,

    base_rent numeric(12, 2) not null,
    currency char(3) not null default 'NGN',
    billing_period varchar(20) not null,

    availability_status varchar(20) not null default 'available',
    available_from date,

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),

    constraint property_units_name_not_blank
        check (char_length(trim(unit_name)) > 0),

    constraint property_units_name_unique_per_property
        unique (property_id, unit_name),

    constraint property_units_type_allowed
        check (
            unit_type in (
                'single_room',
                'self_contained',
                'studio',
                'one_bedroom',
                'two_bedroom',
                'three_bedroom',
                'entire_house'
            )
        ),

    constraint property_units_bedrooms_valid
        check (bedrooms >= 0),

    constraint property_units_bathrooms_valid
        check (bathrooms >= 0),

    constraint property_units_occupants_valid
        check (maximum_occupants >= 1),

    constraint property_units_rent_valid
        check (base_rent > 0),

    constraint property_units_currency_format
        check (currency ~ '^[A-Z]{3}$'),

    constraint property_units_billing_period_allowed
        check (
            billing_period in (
                'monthly',
                'quarterly',
                'yearly'
            )
        ),

    constraint property_units_availability_allowed
        check (
            availability_status in (
                'available',
                'reserved',
                'occupied',
                'unavailable'
            )
        )
);

create index property_units_property_status_idx
    on public.property_units (
        property_id,
        availability_status
    );

create index property_units_available_price_idx
    on public.property_units (
        currency,
        billing_period,
        base_rent
    )
    where availability_status = 'available';

create index property_units_available_from_idx
    on public.property_units(available_from)
    where available_from is not null;

create trigger property_units_set_updated_at
before update on public.property_units
for each row
execute function public.set_updated_at();

alter table public.property_units enable row level security;

revoke all on table public.property_units
from anon, authenticated;

commit;