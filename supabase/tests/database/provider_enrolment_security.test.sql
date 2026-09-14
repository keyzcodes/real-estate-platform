begin;

create extension if not exists pgtap
with schema extensions;

set local search_path = public, extensions;

select plan(19);

-- ============================================================
-- Controlled authentication fixtures
-- Inserting Auth users creates their profiles and seeker roles.
-- ============================================================

insert into auth.users (
    id,
    raw_user_meta_data
)
values
(
    '94000000-0000-4000-8000-000000000001',
    '{"full_name": "Active Provider Test User"}'::jsonb
),
(
    '94000000-0000-4000-8000-000000000002',
    '{"full_name": "Unrelated Test User"}'::jsonb
),
(
    '94000000-0000-4000-8000-000000000003',
    '{"full_name": "Suspended Provider Test User"}'::jsonb
);

update public.profiles
set account_status = 'suspended'
where id = '94000000-0000-4000-8000-000000000003';

-- ============================================================
-- Function security contract
-- ============================================================

select ok(
    to_regprocedure(
        'public.enrol_current_user_as_provider()'
    ) is not null,
    'provider-enrolment function exists'
);

select is(
    (
        select procedures.pronargs::integer
        from pg_proc as procedures
        where procedures.oid = to_regprocedure(
            'public.enrol_current_user_as_provider()'
        )
    ),
    0,
    'provider-enrolment function accepts no UUID or role arguments'
);

select is(
    pg_get_function_result(
        to_regprocedure(
            'public.enrol_current_user_as_provider()'
        )
    ),
    'boolean',
    'provider-enrolment function returns a controlled boolean result'
);

select ok(
    (
        select procedures.prosecdef
        from pg_proc as procedures
        where procedures.oid = to_regprocedure(
            'public.enrol_current_user_as_provider()'
        )
    ),
    'provider-enrolment function uses security definer'
);

select ok(
    coalesce(
        (
            select
                'search_path=""' = any(procedures.proconfig)
            from pg_proc as procedures
            where procedures.oid = to_regprocedure(
                'public.enrol_current_user_as_provider()'
            )
        ),
        false
    ),
    'provider-enrolment function has an empty controlled search path'
);

select ok(
    not has_function_privilege(
        'anon',
        'public.enrol_current_user_as_provider()',
        'EXECUTE'
    ),
    'anonymous visitors cannot execute provider enrolment'
);

select ok(
    has_function_privilege(
        'authenticated',
        'public.enrol_current_user_as_provider()',
        'EXECUTE'
    ),
    'authenticated users can execute provider enrolment'
);

select ok(
    not has_table_privilege(
        'authenticated',
        'public.user_roles',
        'INSERT'
    ),
    'authenticated users cannot insert arbitrary role records directly'
);

-- ============================================================
-- Missing authentication UUID
-- The database role alone is not enough.
-- ============================================================

set local role authenticated;

set local request.jwt.claim.sub = '';

select throws_ok(
    'select public.enrol_current_user_as_provider()',
    '42501',
    'Authentication is required.',
    'provider enrolment rejects a missing authenticated UUID'
);

-- ============================================================
-- Active-user enrolment
-- ============================================================

set local request.jwt.claim.sub =
    '94000000-0000-4000-8000-000000000001';

select is(
    (
        select count(*)
        from public.user_roles
        where role = 'property_seeker'
    ),
    1::bigint,
    'new active user begins with their seeker role'
);

select is(
    public.enrol_current_user_as_provider(),
    true,
    'first provider-enrolment call creates the provider role'
);

select is(
    (
        select count(*)
        from public.user_roles
        where role = 'property_provider'
    ),
    1::bigint,
    'provider role is added to the authenticated user'
);

select is(
    (
        select count(*)
        from public.user_roles
        where role = 'property_seeker'
    ),
    1::bigint,
    'provider enrolment preserves the existing seeker role'
);

select is(
    (
        select count(*)
        from public.user_roles
        where role = 'admin'
    ),
    0::bigint,
    'provider enrolment never grants administrator access'
);

select is(
    public.enrol_current_user_as_provider(),
    false,
    'repeated provider enrolment reports that no role was created'
);

select is(
    (
        select count(*)
        from public.user_roles
        where role = 'property_provider'
    ),
    1::bigint,
    'repeated provider enrolment does not create a duplicate role'
);

-- ============================================================
-- UUID isolation
-- Inspect all rows as the test owner.
-- ============================================================

reset role;

select is(
    (
        select count(*)
        from public.user_roles
        where profile_id =
            '94000000-0000-4000-8000-000000000002'
        and role = 'property_provider'
    ),
    0::bigint,
    'provider enrolment does not change an unrelated user'
);

-- ============================================================
-- Suspended-profile protection
-- ============================================================

set local role authenticated;

set local request.jwt.claim.sub =
    '94000000-0000-4000-8000-000000000003';

select throws_ok(
    'select public.enrol_current_user_as_provider()',
    '42501',
    'Suspended profiles cannot enrol as property providers.',
    'suspended profiles cannot enrol as providers'
);

reset role;

select is(
    (
        select count(*)
        from public.user_roles
        where profile_id =
            '94000000-0000-4000-8000-000000000003'
        and role = 'property_provider'
    ),
    0::bigint,
    'failed suspended-profile enrolment creates no provider role'
);

select * from finish();

rollback;