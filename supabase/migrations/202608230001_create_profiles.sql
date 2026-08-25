begin;

create table public.profiles (
    id uuid primary key
        references auth.users(id) on delete cascade,

    full_name varchar(100) not null,
    phone_number varchar(20) unique,
    avatar_url text,

    account_status varchar(20) not null default 'active',

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),

    constraint profiles_full_name_not_blank
        check (char_length(trim(full_name)) > 0),

    constraint profiles_account_status_allowed
        check (
            account_status in (
                'active',
                'suspended',
                'pending_verification'
            )
        )
);

create table public.user_roles (
    profile_id uuid not null
        references public.profiles(id) on delete cascade,

    role varchar(30) not null,
    created_at timestamptz not null default now(),

    constraint user_roles_primary_key
        primary key (profile_id, role),

    constraint user_roles_role_allowed
        check (
            role in (
                'property_seeker',
                'property_provider',
                'admin'
            )
        )
);

create index user_roles_role_idx
    on public.user_roles(role);

commit;