begin;

create extension if not exists pgtap
with schema extensions;

set local search_path = public, extensions;

select plan(19);

-- ============================================================
-- RLS must remain enabled on every public-catalogue table.
-- ============================================================

select ok(
    (
        select relrowsecurity
        from pg_class
        where oid = 'public.properties'::regclass
    ),
    'RLS is enabled on public.properties'
);

select ok(
    (
        select relrowsecurity
        from pg_class
        where oid = 'public.property_locations'::regclass
    ),
    'RLS is enabled on public.property_locations'
);

select ok(
    (
        select relrowsecurity
        from pg_class
        where oid = 'public.property_units'::regclass
    ),
    'RLS is enabled on public.property_units'
);

select ok(
    (
        select relrowsecurity
        from pg_class
        where oid = 'public.unit_fees'::regclass
    ),
    'RLS is enabled on public.unit_fees'
);

select ok(
    (
        select relrowsecurity
        from pg_class
        where oid = 'public.amenities'::regclass
    ),
    'RLS is enabled on public.amenities'
);

select ok(
    (
        select relrowsecurity
        from pg_class
        where oid = 'public.property_amenities'::regclass
    ),
    'RLS is enabled on public.property_amenities'
);

select ok(
    (
        select relrowsecurity
        from pg_class
        where oid = 'public.unit_amenities'::regclass
    ),
    'RLS is enabled on public.unit_amenities'
);

select ok(
    (
        select relrowsecurity
        from pg_class
        where oid = 'public.property_media'::regclass
    ),
    'RLS is enabled on public.property_media'
);

-- ============================================================
-- Anonymous visitors may read approximate locations.
-- ============================================================

select ok(
    has_column_privilege(
        'anon',
        'public.property_locations',
        'approximate_latitude',
        'SELECT'
    ),
    'anon may read approximate latitude'
);

select ok(
    has_column_privilege(
        'anon',
        'public.property_locations',
        'approximate_longitude',
        'SELECT'
    ),
    'anon may read approximate longitude'
);

-- ============================================================
-- Anonymous visitors must not read exact locations.
-- ============================================================

select ok(
    not has_column_privilege(
        'anon',
        'public.property_locations',
        'street_address',
        'SELECT'
    ),
    'anon may not read exact street addresses'
);

select ok(
    not has_column_privilege(
        'anon',
        'public.property_locations',
        'exact_latitude',
        'SELECT'
    ),
    'anon may not read exact latitude'
);

select ok(
    not has_column_privilege(
        'anon',
        'public.property_locations',
        'exact_longitude',
        'SELECT'
    ),
    'anon may not read exact longitude'
);

-- ============================================================
-- Anonymous visitors must not read ownership or review fields.
-- ============================================================

select ok(
    not has_column_privilege(
        'anon',
        'public.properties',
        'created_by',
        'SELECT'
    ),
    'anon may not read the property creator'
);

select ok(
    not has_column_privilege(
        'anon',
        'public.property_media',
        'uploaded_by',
        'SELECT'
    ),
    'anon may not read the media uploader'
);

select ok(
    not has_column_privilege(
        'anon',
        'public.property_media',
        'verified_by',
        'SELECT'
    ),
    'anon may not read the media verifier'
);

select ok(
    not has_column_privilege(
        'anon',
        'public.property_media',
        'rejection_reason',
        'SELECT'
    ),
    'anon may not read media rejection reasons'
);

-- ============================================================
-- Approved public media identifiers are database-readable.
-- The Express API still hides these raw fields.
-- ============================================================

select ok(
    has_column_privilege(
        'anon',
        'public.property_media',
        'storage_provider',
        'SELECT'
    ),
    'anon may read the provider for approved public media'
);

select ok(
    has_column_privilege(
        'anon',
        'public.property_media',
        'storage_key',
        'SELECT'
    ),
    'anon may read the identifier for approved public media'
);

select * from finish();

rollback;