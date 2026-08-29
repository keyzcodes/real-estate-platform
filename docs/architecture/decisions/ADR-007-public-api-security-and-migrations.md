# ADR-007 — Public API Security and Migration Strategy

## Status

Accepted

## Date

29 August 2026

## Decision Owner

Sunday Jime

## Context

The public property catalogue allows anonymous visitors to retrieve information from Supabase PostgreSQL through the Express API.

The catalogue must return useful property information without exposing:

- Exact locations
- Provider identities
- Administrative identifiers
- Draft or rejected properties
- Unapproved media
- Private storage information
- Database credentials

Database permissions may also change as new public relationships are added. Those changes must remain reproducible across development, testing and production environments.

## Decision

The public catalogue will use defence in depth through:

1. A Supabase publishable key
2. PostgreSQL column permissions
3. Row Level Security
4. Explicit database field selection
5. Zod input validation
6. Route, controller and service separation
7. Controlled public responses
8. Consistent error handling
9. Rate limiting, CORS and security headers
10. Forward-only database migrations

## Publishable Key and RLS

The public API uses a Supabase publishable key operating under the `anon` database role.

This allows PostgreSQL permissions and Row Level Security to remain active.

A service-role or secret key will not be used for anonymous catalogue requests because privileged keys may bypass RLS and increase the impact of application mistakes.

## Explicit Data Projection

Public endpoints explicitly select the fields they require.

They must not use unrestricted queries such as:

```javascript
.select("*")

Explicit field selection prevents newly added private columns from becoming publicly exposed automatically.

The service layer transforms database field names and relationships into a controlled public response.

Request Validation

Public input is validated before database access.

The implementation validates:

Page
Limit
Country code
State
City
Area
Property type
Sort order
Property slug

Only documented values and formats are accepted.

Resource Enumeration Protection

The property-detail endpoint returns the same public 404 response when a property:

Does not exist
Is unpublished
Is unverified
Is otherwise inaccessible

The API does not reveal whether a private draft exists.

Error Handling

The API returns controlled errors using the structure:

{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "A safe public message."
  }
}

The API must not expose:

SQL statements
Stack traces
Environment variables
Internal database errors
Supabase credentials
Private resource states
Forward-Only Migrations

Once a migration has been applied to a shared or remote database, it must not be rewritten to introduce a correction.

Corrections must be added using a newer migration.

For example, when public fee access was found to be missing, the existing public-catalogue migration was preserved and a new migration was created:

20260825231400_allow_public_read_unit_fees.sql

This keeps migration history consistent with the database that executed it.

Seed Data Separation

Database migrations define permanent structural and security changes.

Reusable demonstration content belongs in:

supabase/seed.sql

Seed data must not be placed in structural migrations unless the data is required permanently for the application to function.

Alternatives Considered
Use a service-role key for all backend requests

This was rejected because it could bypass RLS and make the Express application the only protection against private-data exposure.

Depend only on RLS

This was rejected because database security should be reinforced by explicit API field selection, validation and response transformation.

Depend only on Express

This was rejected because an application bug could expose records that the database would otherwise have blocked.

Edit an applied migration

This was rejected because the migration file would no longer describe what the remote database originally executed.

Insert demonstration listings through migrations

This was rejected because replaceable test content should not become part of permanent schema history.

Consequences
Positive
Security is enforced at multiple layers.
Application mistakes are less likely to expose private records.
Public API responses remain deliberate and reviewable.
Migration history remains truthful and reproducible.
Database structure remains separate from demonstration data.
Private resources are harder to enumerate.
Negative
RLS and column permissions require additional design and testing.
Public relational queries may require several coordinated policies.
Explicit field selections require maintenance when the API changes.
Corrective changes create additional migration files.
Debugging permission problems can take more time.
Required Tests

Before merging a public endpoint, tests must confirm:

Published and verified records are readable.
Draft records are not publicly readable.
Unverified records are not publicly readable.
Exact addresses are absent.
Exact coordinates are absent.
Provider identifiers are absent.
Invalid input is rejected.
Nonexistent and private resources share the same public 404.
Internal error details are not returned.
Database migrations apply in the expected order.
Future Review

This decision should be reviewed when the platform introduces:

Authenticated customer requests
Provider and administrator APIs
Property creation and editing
Booking and payment
Controlled exact-location disclosure
Automated integration testing
Separate production credentials

Privileged database credentials may be introduced only for narrowly scoped trusted operations with documented authorisation and auditing.