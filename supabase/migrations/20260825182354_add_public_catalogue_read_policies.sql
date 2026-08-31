-- ============================================================
-- Public properties
-- ============================================================

grant select (
    id,
    slug,
    title,
    description,
    property_type,
    country_code,
    state_region,
    city,
    area,
    verification_status,
    publication_status,
    created_at,
    updated_at
)
on table public.properties
to anon, authenticated;

create policy properties_public_read_published
on public.properties
for select
to anon, authenticated
using (
    publication_status = 'published'
    and verification_status = 'verified'
);

-- ============================================================
-- Safe approximate locations
-- Exact addresses and coordinates are deliberately excluded.
-- ============================================================

grant select (
    property_id,
    approximate_latitude,
    approximate_longitude,
    verified_at
)
on table public.property_locations
to anon, authenticated;

create policy property_locations_public_read
on public.property_locations
for select
to anon, authenticated
using (
    exists (
        select 1
        from public.properties
        where properties.id = property_locations.property_id
          and properties.publication_status = 'published'
          and properties.verification_status = 'verified'
    )
);

-- ============================================================
-- Public property units
-- ============================================================

grant select (
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
    available_from,
    created_at,
    updated_at
)
on table public.property_units
to anon, authenticated;

create policy property_units_public_read
on public.property_units
for select
to anon, authenticated
using (
    exists (
        select 1
        from public.properties
        where properties.id = property_units.property_id
          and properties.publication_status = 'published'
          and properties.verification_status = 'verified'
    )
);

-- ============================================================
-- Approved public media
-- storage_key is a public Cloudinary media identifier, not a secret.
-- ============================================================

grant select (
    id,
    property_id,
    unit_id,
    media_type,
    media_category,
    storage_provider,
    storage_key,
    format,
    width_pixels,
    height_pixels,
    duration_seconds,
    alt_text,
    display_order,
    is_cover,
    captured_at,
    verified_at
)
on table public.property_media
to anon, authenticated;

create policy property_media_public_read_approved
on public.property_media
for select
to anon, authenticated
using (
    verification_status = 'approved'
    and exists (
        select 1
        from public.properties
        where properties.id = property_media.property_id
          and properties.publication_status = 'published'
          and properties.verification_status = 'verified'
    )
);

-- ============================================================
-- Public property amenity relationships
-- ============================================================

grant select (
    property_id,
    amenity_id
)
on table public.property_amenities
to anon, authenticated;

create policy property_amenities_public_read
on public.property_amenities
for select
to anon, authenticated
using (
    exists (
        select 1
        from public.properties
        where properties.id = property_amenities.property_id
          and properties.publication_status = 'published'
          and properties.verification_status = 'verified'
    )
);

-- ============================================================
-- Public unit amenity relationships
-- ============================================================

grant select (
    unit_id,
    amenity_id
)
on table public.unit_amenities
to anon, authenticated;

create policy unit_amenities_public_read
on public.unit_amenities
for select
to anon, authenticated
using (
    exists (
        select 1
        from public.property_units
        join public.properties
          on properties.id = property_units.property_id
        where property_units.id = unit_amenities.unit_id
          and properties.publication_status = 'published'
          and properties.verification_status = 'verified'
    )
);