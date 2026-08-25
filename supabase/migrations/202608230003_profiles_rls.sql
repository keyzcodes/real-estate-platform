begin;

alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;

revoke all on table public.profiles from anon, authenticated;
revoke all on table public.user_roles from anon, authenticated;

grant select on table public.profiles to authenticated;

grant update (
    full_name,
    phone_number,
    avatar_url
)
on table public.profiles
to authenticated;

grant select on table public.user_roles to authenticated;

create policy profiles_select_own
on public.profiles
for select
to authenticated
using (
    id = (select auth.uid())
);

create policy profiles_update_own
on public.profiles
for update
to authenticated
using (
    id = (select auth.uid())
)
with check (
    id = (select auth.uid())
);

create policy user_roles_select_own
on public.user_roles
for select
to authenticated
using (
    profile_id = (select auth.uid())
);

commit;