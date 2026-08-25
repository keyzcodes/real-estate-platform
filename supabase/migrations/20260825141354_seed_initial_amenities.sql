insert into public.amenities (
    name,
    slug,
    category,
    description,
    allowed_scope
)
values
    -- Utilities
    ('Running Water', 'running-water', 'utilities',
     'Regular water supply is available.', 'both'),

    ('Electricity', 'electricity', 'utilities',
     'The property or unit is connected to electricity.', 'both'),

    ('Backup Power', 'backup-power', 'utilities',
     'Alternative electricity is available during outages.', 'property'),

    ('Solar Power', 'solar-power', 'utilities',
     'Solar energy supports the property or unit.', 'both'),

    ('Borehole', 'borehole', 'utilities',
     'The property has a private groundwater supply.', 'property'),

    ('Prepaid Meter', 'prepaid-meter', 'utilities',
     'Electricity usage is measured using a prepaid meter.', 'unit'),

    ('Waste Disposal', 'waste-disposal', 'utilities',
     'A managed waste collection or disposal system is available.', 'property'),

    -- Security
    ('Gated Compound', 'gated-compound', 'security',
     'Entry into the compound is controlled by a gate.', 'property'),

    ('Security Personnel', 'security-personnel', 'security',
     'Security personnel are present at the property.', 'property'),

    ('CCTV Surveillance', 'cctv-surveillance', 'security',
     'Security cameras monitor designated areas.', 'property'),

    ('Perimeter Fence', 'perimeter-fence', 'security',
     'The property is surrounded by a protective fence or wall.', 'property'),

    ('Fire Extinguisher', 'fire-extinguisher', 'security',
     'Fire-extinguishing equipment is available.', 'both'),

    -- Comfort
    ('Air Conditioning', 'air-conditioning', 'comfort',
     'The unit has an air-conditioning system.', 'unit'),

    ('Ceiling Fan', 'ceiling-fan', 'comfort',
     'The unit has a ceiling fan.', 'unit'),

    ('Furnished', 'furnished', 'comfort',
     'Essential furniture is included.', 'unit'),

    ('Wardrobe', 'wardrobe', 'comfort',
     'The unit includes storage for clothing.', 'unit'),

    ('Balcony', 'balcony', 'comfort',
     'The unit includes a private or attached balcony.', 'unit'),

    -- Accessibility
    ('Accessible Entrance', 'accessible-entrance', 'accessibility',
     'The property has an entrance designed for easier accessibility.', 'property'),

    ('Elevator', 'elevator', 'accessibility',
     'An elevator provides access between floors.', 'property'),

    -- Parking
    ('Car Parking', 'car-parking', 'parking',
     'Space is available for parking cars.', 'property'),

    ('Motorcycle Parking', 'motorcycle-parking', 'parking',
     'Space is available for parking motorcycles.', 'property'),

    -- Shared facilities
    ('Shared Kitchen', 'shared-kitchen', 'shared_facilities',
     'Residents have access to a shared kitchen.', 'property'),

    ('Laundry Area', 'laundry-area', 'shared_facilities',
     'A designated laundry area is available.', 'property'),

    ('Gym', 'gym', 'shared_facilities',
     'Residents have access to exercise facilities.', 'property'),

    ('Swimming Pool', 'swimming-pool', 'shared_facilities',
     'Residents have access to a swimming pool.', 'property'),

    -- Connectivity
    ('Wi-Fi', 'wi-fi', 'connectivity',
     'Wireless internet access is available.', 'both'),

    ('Fibre Internet', 'fibre-internet', 'connectivity',
     'The property or unit supports fibre internet connectivity.', 'both'),

    ('Strong Mobile Network', 'strong-mobile-network', 'connectivity',
     'The location generally has reliable mobile network coverage.', 'property')
on conflict (slug) do nothing;