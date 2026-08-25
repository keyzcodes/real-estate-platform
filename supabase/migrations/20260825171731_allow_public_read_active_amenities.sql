-- Allow public application roles to read only safe amenity columns.
grant select (
    id,
    name,
    slug,
    category,
    description,
    allowed_scope,
    is_active
)
on table public.amenities
to anon, authenticated;

-- RLS limits public results to active amenities.
create policy amenities_public_read_active
on public.amenities
for select
to anon, authenticated
using (is_active = true);