# Database Constraints and Index Strategy

## Project

Real Estate Platform

## Purpose

This document defines how the database will prevent invalid data and efficiently support expected application queries.

## Principles

- Constraints protect data integrity.
- Indexes support demonstrated query patterns.
- Foreign-key columns used in joins should normally be indexed.
- Frequently filtered and sorted columns should be considered for indexing.
- Every column should not be indexed automatically.
- Security policies do not replace database constraints.
---

## Expected Query Patterns

The MVP must efficiently support these common queries:

1. Show published and verified properties in a selected city or area.
2. Filter properties by property type.
3. Retrieve all units belonging to a property.
4. Retrieve available units within a selected price range.
5. Display approved property media in the correct order.
6. Retrieve all fees for a selected unit.
7. Retrieve property and unit amenities.
8. Show a customer’s inquiries and bookings.
9. Show inquiries assigned to a property contact.
10. Check whether a unit has conflicting bookings.
11. Allow administrators to review pending properties, media and contacts.

---

## Automatically Created Indexes

PostgreSQL automatically creates indexes for:

- Primary keys
- Unique constraints

Examples include:

- `profiles.id`
- `properties.id`
- `bookings.booking_reference`
- `amenities.name`
- `amenities.slug`
- `property_media.storage_key`

A separate duplicate index must not be created for these columns.

---

## Planned Indexes

### Profiles

- `role`
- `account_status`

These support administrative filtering. They may later become one composite index if queries commonly filter by both columns.

### Properties

Composite public-search index:

`publication_status, verification_status, city, property_type`

Additional indexes:

- `created_by`
- `state, city`
- `created_at`

### Property Units

- `property_id`
- `property_id, availability_status`
- `base_rent`
- `available_from`

### Unit Fees

- `unit_id`
- `unit_id, is_mandatory`

### Property Media

- `property_id, verification_status, display_order`

This supports loading approved media in display order.

### Property Contacts

- `property_id`
- `profile_id`
- `verification_status`
- A unique partial index allowing only one primary contact per property

### Inquiries

- `customer_id, submitted_at`
- `property_id, status`
- `assigned_contact_id, status`

### Bookings

- `customer_id, created_at`
- `unit_id, start_date, end_date`
- `unit_id, status`

### Booking Occupants

- `booking_id`
- `profile_id`
- A unique partial index allowing only one primary occupant per booking

### Junction Tables

The composite primary keys on these tables already support lookups beginning with their first column:

- `property_amenities (property_id, amenity_id)`
- `unit_amenities (unit_id, amenity_id)`

Additional reverse indexes are required for lookups by `amenity_id`.

---

## Index Decisions

- Do not create individual indexes on every Boolean column.
- Do not duplicate primary-key or unique-constraint indexes.
- Foreign keys are not automatically indexed by PostgreSQL.
- Composite-index column order must match common filter patterns.
- Index usage must be reviewed later with `EXPLAIN ANALYZE`.
- Unused indexes should be removed after evidence-based review.

## Future Search Improvements

The MVP will begin with normal PostgreSQL filtering.

Later improvements may include:

- PostgreSQL full-text search for titles and descriptions
- Trigram indexes for misspelled location searches
- PostGIS spatial indexes for map-radius searches

These will be added only when their corresponding features are implemented.

---

## Database Constraints

### Profiles

- `id` must reference `auth.users.id`.
- `full_name` cannot be empty.
- `phone_number` must be unique when provided.
- `role` must contain an allowed role.
- `account_status` must contain an allowed status.

### Properties

- `created_by` must reference an existing profile.
- `title` and `description` cannot be empty.
- `latitude` must be between `-90` and `90`.
- `longitude` must be between `-180` and `180`.
- Latitude and longitude must both be present or both be absent.
- Property, verification and publication statuses must contain allowed values.

### Property Units

- `property_id` must reference an existing property.
- `bedrooms` and `bathrooms` cannot be negative.
- `maximum_occupants` must be at least `1`.
- `base_rent` must be greater than `0`.
- `currency` must contain exactly three uppercase letters.
- Unit type, billing period and availability status must contain allowed values.

### Unit Fees

- `unit_id` must reference an existing unit.
- `amount` cannot be negative.
- `currency` must contain exactly three uppercase letters.
- A fee using the `other` type must include a description.

### Property Media

- `property_id` must reference an existing property.
- `storage_key` must be unique.
- `display_order` cannot be negative.
- Images must have alternative text.
- Each property can have only one cover image.

### Amenities

- `name` and `slug` must be unique.
- `slug` must use a URL-safe format.
- Category and scope must contain allowed values.

### Property Contacts

- `property_id` must reference an existing property.
- At least one phone number or email address must be provided.
- Each property can have only one primary contact.
- Contact role and verification status must contain allowed values.

### Inquiries

- Customer and property references are required.
- Message length must be limited.
- Inquiry status and contact method must contain allowed values.
- If a unit is selected, it must belong to the selected property.

### Bookings

- Customer and unit references are required.
- `end_date` must be later than `start_date`.
- Price snapshots cannot be negative.
- `total_snapshot` must equal rent plus mandatory fees.
- `terms_accepted_at` is required.
- Confirmed bookings for one unit must not overlap.

### Booking Occupants

- `booking_id` is required.
- `full_name` cannot be empty.
- Each booking can have only one primary occupant.
- Occupant count cannot exceed the unit’s maximum occupancy.

---

## Enforcement Levels

### Direct Database Constraints

Use PostgreSQL constraints for rules involving one row:

- `PRIMARY KEY`
- `FOREIGN KEY`
- `UNIQUE`
- `NOT NULL`
- `CHECK`

### Partial Unique Indexes

Use partial unique indexes for:

- One cover image per property
- One primary contact per property
- One primary occupant per booking

### Transactions, Triggers or Backend Services

Rules involving multiple rows require controlled database transactions, triggers or backend validation:

- Preventing overlapping bookings
- Confirming that an inquiry’s unit belongs to its property
- Enforcing maximum occupant count
- Requiring approved media before publishing
- Keeping unit availability consistent with bookings

Backend validation improves error messages, but the database must enforce critical integrity rules wherever practical.

---

## Account and Data Deletion Policy

### User Confirmation

Before deleting an account, the interface must:

- Clearly state that the action is permanent.
- Explain which information will be deleted or retained.
- Require the user to confirm the action.
- Require recent authentication or password verification.
- Display a final message such as:

> Are you sure you want to delete your account? Your profile and personal information will be removed permanently. This action cannot be undone.

The frontend confirmation improves user experience, but the backend must still authenticate and authorise the deletion request.

### Account Deletion Rules

- Users can request deletion of their own accounts.
- Administrators cannot silently delete accounts without an authorised reason and audit record.
- Open bookings must be cancelled or resolved before deletion.
- Supabase Auth credentials must be deleted.
- Personal profile information must be deleted or anonymised.
- Private occupant information that is no longer required must be removed.
- Property contact assignments must be removed or reassigned.
- Completed booking records may be retained without unnecessary personal information.
- Financial records may later require retention for accounting, dispute or legal purposes.

### Foreign-Key Behaviour

- `profiles` should be removed when its Supabase Auth user is deleted.
- Customer inquiries may be deleted with the customer account.
- Historical bookings should remain, but their `customer_id` may become `NULL`.
- `property_contacts.profile_id` may become `NULL` or be reassigned.
- `booking_occupants.profile_id` may become `NULL`.
- A user who owns active property listings must transfer or archive them before account deletion.

### Property Deletion Rules

- Properties with booking history must be archived instead of deleted.
- Units with booking history must not be deleted.
- Unbooked draft properties may be permanently deleted.
- Historical booking and agreed-price records must be preserved.    

## Pending Schema Adjustment

When implementing the `bookings` table:

- `customer_id` is required when a booking is created.
- The foreign key will use `ON DELETE SET NULL`.
- Historical bookings will remain after account deletion.
- Personal customer information will be removed or anonymised.