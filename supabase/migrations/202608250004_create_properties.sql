begin;

create table public.properties (
    id uuid primary key default gen_random_uuid(),

    created_by uuid not null
        references public.profiles(id) on delete restrict,

    title varchar(150) not null,
    description text not null,
    property_type varchar(30) not null,

    country_code char(2) not null default 'NG',
    state_region varchar(100) not null,
    city varchar(100) not null,
    area varchar(150) not null,

    verification_status varchar(20) not null default 'pending',
    publication_status varchar(20) not null default 'draft',

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),

    constraint properties_title_not_blank
        check (char_length(trim(title)) > 0),

    constraint properties_description_not_blank
        check (char_length(trim(description)) > 0),

    constraint properties_type_allowed
        check (
            property_type in (
                'hostel',
                'apartment_building',
                'house',
                'duplex',
                'bungalow',
                'compound'
            )
        ),

    constraint properties_country_code_format
        check (country_code ~ '^[A-Z]{2}$'),

    constraint properties_location_not_blank
        check (
            char_length(trim(state_region)) > 0
            and char_length(trim(city)) > 0
            and char_length(trim(area)) > 0
        ),

    constraint properties_verification_status_allowed
        check (
            verification_status in (
                'pending',
                'verified',
                'rejected'
            )
        ),

    constraint properties_publication_status_allowed
        check (
            publication_status in (
                'draft',
                'published',
                'unpublished',
                'archived'
            )
        ),

    constraint properties_publish_only_when_verified
        check (
            publication_status <> 'published'
            or verification_status = 'verified'
        )
);

create index properties_created_by_idx
    on public.properties(created_by);

create index properties_public_search_idx
    on public.properties (
        country_code,
        state_region,
        city,
        area,
        property_type,
        created_at desc
    )
    where (
        publication_status = 'published'
        and verification_status = 'verified'
    );

create index properties_pending_review_idx
    on public.properties(verification_status, created_at)
    where verification_status = 'pending';

create trigger properties_set_updated_at
before update on public.properties
for each row
execute function public.set_updated_at();

alter table public.properties enable row level security;

revoke all on table public.properties from anon, authenticated;

commit;