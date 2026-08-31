begin;

do $$
declare
    admin_profile_id uuid;
    demo_property_id uuid :=
        '10000000-0000-4000-8000-000000000001';

    demo_unit_id uuid :=
        '20000000-0000-4000-8000-000000000001';

    demo_media_id uuid :=
        '30000000-0000-4000-8000-000000000001';
begin
    -- Select the first configured administrator.
    select profile_id
    into admin_profile_id
    from public.user_roles
    where role = 'admin'
    order by created_at
    limit 1;

    if admin_profile_id is null then
        raise exception
            'Demo data requires an existing admin profile.';
    end if;

    -- Make the script safe to run repeatedly.
    if exists (
        select 1
        from public.properties
        where id = demo_property_id
    ) then
        raise notice 'Demo property already exists. No changes made.';
        return;
    end if;

    -- Create the property as a draft first.
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
    values (
        demo_property_id,
        admin_profile_id,
        'Demo Green View Residence',
        'A demonstration verified rental property used to test the public catalogue.',
        'apartment_building',
        'NG',
        'Borno',
        'Maiduguri',
        'Bolori',
        'verified',
        'draft'
    );

    -- Add protected exact location information.
    insert into public.property_locations (
        property_id,
        street_address,
        postal_code,
        exact_latitude,
        exact_longitude,
        location_source,
        accuracy_meters,
        captured_at,
        verified_at,
        verified_by
    )
    values (
        demo_property_id,
        'Demo address—not a real listing',
        null,
        11.846500,
        13.157100,
        'manual',
        null,
        now(),
        now(),
        admin_profile_id
    );

    -- Add one available rentable unit.
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
        demo_unit_id,
        demo_property_id,
        'Demo Self-contained Unit',
        'self_contained',
        'A demonstration unit with private facilities.',
        1,
        1,
        2,
        300000,
        'NGN',
        'yearly',
        'available',
        current_date
    );

    -- Add a transparent refundable fee.
    insert into public.unit_fees (
        unit_id,
        fee_type,
        fee_name,
        description,
        amount,
        currency,
        payment_frequency,
        is_mandatory,
        is_refundable
    )
    values (
        demo_unit_id,
        'caution',
        'Refundable caution deposit',
        'Refundable according to the tenancy conditions.',
        30000,
        'NGN',
        'one_time',
        true,
        true
    );

    -- Add approved cover metadata.
    -- The real Cloudinary file will be added during media integration.
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
        demo_media_id,
        demo_property_id,
        null,
        admin_profile_id,
        'image',
        'exterior',
        'cloudinary',
        'demo/green-view-residence-cover',
        'jpg',
        1,
        1200,
        800,
        null,
        'Demonstration exterior view of Green View Residence',
        0,
        true,
        'approved',
        now(),
        now(),
        admin_profile_id
    );

    -- Attach property-level amenities.
    insert into public.property_amenities (
        property_id,
        amenity_id
    )
    select
        demo_property_id,
        id
    from public.amenities
    where slug in (
        'running-water',
        'electricity',
        'gated-compound',
        'car-parking'
    );

    -- Attach unit-level amenities.
    insert into public.unit_amenities (
        unit_id,
        amenity_id
    )
    select
        demo_unit_id,
        id
    from public.amenities
    where slug in (
        'wardrobe',
        'ceiling-fan',
        'prepaid-meter'
    );

    -- Publish only after all required records exist.
    update public.properties
    set publication_status = 'published'
    where id = demo_property_id;
end;
$$;

commit;