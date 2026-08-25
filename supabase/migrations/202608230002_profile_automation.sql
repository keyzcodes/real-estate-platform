begin;

create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
    insert into public.profiles (
        id,
        full_name,
        phone_number
    )
    values (
        new.id,
        coalesce(
            nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''),
            'New User'
        ),
        new.phone
    );

    insert into public.user_roles (
        profile_id,
        role
    )
    values (
        new.id,
        'property_seeker'
    );

    return new;
end;
$$;

create trigger create_profile_after_signup
after insert on auth.users
for each row
execute function public.handle_new_user();

revoke execute on function public.set_updated_at()
from public, anon, authenticated;

revoke execute on function public.handle_new_user()
from public, anon, authenticated;

commit;