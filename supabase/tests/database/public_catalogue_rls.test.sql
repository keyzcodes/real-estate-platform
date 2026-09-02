begin;

create extension if not exists pgtap
with schema extensions;

set local search_path = public, extensions;

select plan(8);

-- ============================================================
-- Controlled test owner
-- Inserting an Auth user triggers profile creation automatically.
-- ============================================================

insert into auth.users (
    id,
    raw_user_meta_data
)
values (
    '90000000-0000-4000-8000-000000000001',
    '{"full_name": "RLS Test Owner"}'::jsonb
);

-- ============================================================
-- Controlled property fixtures
-- All properties begin as drafts.
-- ============================================================

insert into public.properties (
    id,
    created_by,
    title,
    description,
    property_type,
    country_code,
    state_region,
    city,
    area,
    verification_status,
    publication_status
)
values
(
    '91000000-0000-4000-8000-000000000001',
    '90000000-0000-4000-8000-000000000001',
    'Public RLS Test Property',
    'Published and verified property for automated testing.',
    'apartment_building',
    'NG',
    'Borno',
    'Maiduguri',
    'Bolori',
    'verified',
    'draft'
),
(
    '91000000-0000-4000-8000-000000000002',
    '90000000-0000-4000-8000-000000000001',
    'Private Draft RLS Test Property',
    'Verified property that remains in draft.',
    'house',
    'NG',
    'Borno',
    'Maiduguri',
    'Mairi',
    'verified',
    'draft'
),
(
    '91000000-0000-4000-8000-000000000003',
    '90000000-0000-4000-8000-000000000001',
    'Pending RLS Test Property',
    'Unverified property that remains in draft.',
    'bungalow',
    'NG',
    'Borno',
    'Maiduguri',
    'GRA',
    'pending',
    'draft'
);

-- ============================================================
-- Publication prerequisite
-- A property needs a verified location before publication.
-- ============================================================

insert into public.property_locations (
    property_id,
    street_address,
    exact_latitude,
    exact_longitude,
    location_source,
    captured_at,
    verified_at,
    verified_by
)
values (
    '91000000-0000-4000-8000-000000000001',
    'RLS test address',
    11.846500,
    13.157100,
    'manual',
    now(),
    now(),
    '90000000-0000-4000-8000-000000000001'
);
-- Add the unit required before publication.
insert into public.property_units (
    id,
    property_id,
    unit_name,
    unit_type,
    description,
    bedrooms,
    bathrooms,
    maximum_occupants,
    base_rent,
    currency,
    billing_period,
    availability_status,
    available_from
)
values (
    '92000000-0000-4000-8000-000000000001',
    '91000000-0000-4000-8000-000000000001',
    'RLS Test Unit',
    'self_contained',
    'Controlled unit fixture for RLS testing.',
    1,
    1,
    2,
    300000,
    'NGN',
    'yearly',
    'available',
    current_date
);

-- Add the approved cover image required before publication.
insert into public.property_media (
    id,
    property_id,
    unit_id,
    uploaded_by,
    media_type,
    media_category,
    storage_provider,
    storage_key,
    format,
    file_size_bytes,
    width_pixels,
    height_pixels,
    duration_seconds,
    alt_text,
    display_order,
    is_cover,
    verification_status,
    captured_at,
    verified_at,
    verified_by
)
values (
    '93000000-0000-4000-8000-000000000001',
    '91000000-0000-4000-8000-000000000001',
    null,
    '90000000-0000-4000-8000-000000000001',
    'image',
    'exterior',
    'cloudinary',
    'tests/public-rls-cover',
    'jpg',
    1,
    1200,
    800,
    null,
    'Controlled cover-image fixture for RLS testing',
    0,
    true,
    'approved',
    now(),
    now(),
    '90000000-0000-4000-8000-000000000001'
);

-- Publish only after all publication prerequisites exist.
update public.properties
set publication_status = 'published'
where id = '91000000-0000-4000-8000-000000000001';

-- ============================================================
-- Anonymous visitor assertions
-- ============================================================

set local role anon;

select is(
    (
        select count(*)
        from public.properties
        where id = '91000000-0000-4000-8000-000000000001'
    ),
    1::bigint,
    'anon can read a published and verified property'
);

select is(
    (
        select count(*)
        from public.properties
        where id = '91000000-0000-4000-8000-000000000002'
    ),
    0::bigint,
    'anon cannot read a verified draft property'
);

select is(
    (
        select count(*)
        from public.properties
        where id = '91000000-0000-4000-8000-000000000003'
    ),
    0::bigint,
    'anon cannot read a pending draft property'
);

select is(
    (
        select count(*)
        from public.properties
        where id in (
            '91000000-0000-4000-8000-000000000001',
            '91000000-0000-4000-8000-000000000002',
            '91000000-0000-4000-8000-000000000003'
        )
    ),
    1::bigint,
    'anon sees only one eligible property among all fixtures'
);

-- ============================================================
-- Authenticated customer assertions
-- Public catalogue visibility is the same for this role.
-- ============================================================

reset role;

set local role authenticated;

select is(
    (
        select count(*)
        from public.properties
        where id = '91000000-0000-4000-8000-000000000001'
    ),
    1::bigint,
    'authenticated users can read a published and verified property'
);

select is(
    (
        select count(*)
        from public.properties
        where id = '91000000-0000-4000-8000-000000000002'
    ),
    0::bigint,
    'authenticated users cannot read a verified draft property'
);

select is(
    (
        select count(*)
        from public.properties
        where id = '91000000-0000-4000-8000-000000000003'
    ),
    0::bigint,
    'authenticated users cannot read a pending draft property'
);

select is(
    (
        select count(*)
        from public.properties
        where id in (
            '91000000-0000-4000-8000-000000000001',
            '91000000-0000-4000-8000-000000000002',
            '91000000-0000-4000-8000-000000000003'
        )
    ),
    1::bigint,
    'authenticated users see only one eligible property among all fixtures'
);

select * from finish();

rollback;