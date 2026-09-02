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
    'published'
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
-- The public catalogue policy gives the same catalogue visibility.
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