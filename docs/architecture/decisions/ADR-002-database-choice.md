# ADR-002: Database and Supabase Selection

## Status

Accepted

## Date

22 August 2026

## Context

The Real Estate Platform requires a database that can safely manage:

- User profiles
- Property providers
- Physical properties
- Property units
- Listings
- Rent and additional fees
- Amenities
- Media metadata
- Geographic locations
- Verification records
- Inquiries
- Listing reports
- Audit logs
- Future reservations and payments

The data contains strong relationships and requires consistency.

For example:

```text
Property
└── Property Unit
    └── Listing
        ├── Listing Fees
        ├── Media
        ├── Inquiries
        └── Reports
```
