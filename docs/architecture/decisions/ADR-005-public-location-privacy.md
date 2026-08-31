# ADR-005 — Protect Exact Property Locations

## Status

Accepted

## Date

29 August 2026

## Decision Owner

Sunday Jime

## Context

Visitors need enough location information to decide whether a rental property is relevant to them.

However, publishing exact street addresses and GPS coordinates could create:

- Privacy risks for occupants and providers
- Trespassing and physical-security risks
- Property-listing circumvention
- Unauthorised direct approaches
- Exposure of private or occupied residences
- Increased impact if public catalogue data is scraped

The platform must balance property discovery with location privacy.

## Decision

The public catalogue will return only:

- Country
- State or region
- City
- General area
- Approximate latitude
- Approximate longitude
- Location-verification indicator

The public catalogue will not return:

- Street address
- Postal address where it reveals the property
- Exact latitude
- Exact longitude
- Internal location-capture metadata
- Location verifier identity

Exact location information will remain in a protected database relationship with restricted permissions.

## Implementation

The database stores exact and approximate location information separately.

Public database roles receive access only to approved public-location fields.

The Express service explicitly selects and returns approximate coordinates.

The public response uses:

```json
{
  "location": {
    "countryCode": "NG",
    "stateRegion": "Borno",
    "city": "Maiduguri",
    "area": "Bolori",
    "approximateLatitude": 11.847,
    "approximateLongitude": 13.157,
    "isLocationVerified": true
  }
}

It does not include exact address or exact-coordinate fields.

Alternatives Considered
Publish exact locations

This would make navigation easier and could improve map precision.

It was rejected because public convenience does not justify exposing occupied or privately managed property locations before an appropriate disclosure stage.

Return no map coordinates

This would provide the strongest location privacy.

It was rejected because visitors still need geographic context to assess distance, neighbourhood and general suitability.

Depend only on the frontend to hide exact locations

The frontend could receive exact coordinates but avoid displaying them.

It was rejected because hidden frontend data remains accessible through browser developer tools and network responses.

Consequences
Positive
Occupants and providers receive stronger privacy protection.
Public data scraping has a lower security impact.
Visitors still receive useful geographic context.
The API follows data-minimisation principles.
Exact-location disclosure can later be controlled through an authorised workflow.
Negative
Public maps will be less precise.
Visitors cannot navigate directly to a property using the catalogue response.
The platform may require a later controlled exact-location disclosure process.
Approximate-coordinate generation and storage add implementation complexity.
Security Controls

Location privacy is enforced through:

PostgreSQL column permissions
Row Level Security
Explicit API field selection
Service-layer response transformation
Privacy-focused endpoint tests
Prohibition of unrestricted public SELECT * queries
Validation

Public catalogue tests must confirm that responses do not contain:

street_address
postal_code
exact_latitude
exact_longitude
location_source
captured_by
verified_by

Tests must also confirm that approved approximate location fields remain available.

Future Review

This decision should be reviewed when the platform implements:

Provider-to-customer contact
Property inspections
Booking
Payments
Map navigation
Controlled location disclosure
Fraud and abuse prevention

Any future exact-location disclosure must require a documented authorisation rule and must not weaken anonymous public access controls.