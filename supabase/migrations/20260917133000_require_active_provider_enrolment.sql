begin;

create or replace function public.enrol_current_user_as_provider()
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
    authenticated_profile_id uuid := (select auth.uid());
    current_account_status varchar(20);
    role_was_created boolean;
begin
    if authenticated_profile_id is null then
        raise exception using
            errcode = '42501',
            message = 'Authentication is required.';
    end if;

    select profiles.account_status
    into current_account_status
    from public.profiles as profiles
    where profiles.id = authenticated_profile_id;

    if not found then
        raise exception using
            errcode = 'P0002',
            message = 'Authenticated profile was not found.';
    end if;

    if current_account_status <> 'active' then
        raise exception using
            errcode = '42501',
            message = 'Only active profiles can enrol as property providers.';
    end if;

    insert into public.user_roles (
        profile_id,
        role
    )
    values (
        authenticated_profile_id,
        'property_provider'
    )
    on conflict (profile_id, role) do nothing;

    role_was_created := found;

    return role_was_created;
end;
$$;

comment on function public.enrol_current_user_as_provider() is
'Adds property_provider only to the authenticated caller. The function accepts no UUID or role arguments, requires an active profile, and is safe to repeat.';

revoke execute
on function public.enrol_current_user_as_provider()
from public, anon, authenticated;

grant execute
on function public.enrol_current_user_as_provider()
to authenticated;

commit;