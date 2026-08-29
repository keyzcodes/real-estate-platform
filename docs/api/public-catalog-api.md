# Public Property Catalogue API

## Project

Real Estate Platform

## Status

Implemented on:

```text
feature/public-property-catalogue

The feature remains under documentation and Pull Request review and has not yet been merged into main.

Purpose

This document defines the public API used by visitors to browse published and verified rental properties without exposing private property, provider or administrative information.

Base URL
/api/v1

The /v1 prefix allows future API changes without immediately breaking existing clients.

Public Catalogue Rules

A property may appear publicly only when:

publication_status = published
verification_status = verified

Property media may appear publicly only when:

verification_status = approved

The public API must never return:

Exact street addresses
Exact GPS coordinates
Provider profile identifiers
Provider phone numbers
Provider email addresses
Administrator identifiers
Uploader identifiers
Verification documents
Media rejection reasons
Pending, rejected, unpublished or archived properties
Pending or rejected media
Supabase secrets
Cloudinary credentials
Private storage configuration
Standard Success Response
{
  "success": true,
  "data": {}
}
Standard Error Response
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "A safe public error message."
  }
}

Internal database errors, SQL statements, environment variables and stack traces must never be returned to visitors.

1. List Public Properties
Endpoint
GET /api/v1/properties
Purpose

Returns a paginated list of published and verified properties.

Implemented Query Parameters
Parameter	Example	Default	Validation
page	1	1	Whole number of at least 1
limit	12	12	Whole number from 1 to 50
country	NG	None	Two-letter country code
state	Borno	None	Maximum 100 characters
city	Maiduguri	None	Maximum 100 characters
area	Bolori	None	Maximum 150 characters
propertyType	apartment_building	None	Must be an allowed property type
sort	newest	newest	newest or oldest

Location filters are case-insensitive.

For example:

maiduguri

can match:

Maiduguri
Allowed Property Types
hostel
apartment_building
house
duplex
bungalow
compound
Allowed Sort Values
newest
oldest
Pagination Rules
Default page: 1
Default limit: 12
Maximum limit: 50
Page and limit must be whole numbers.
Negative and zero values are rejected.
Unlimited public catalogue requests are not permitted.
Example Request
GET /api/v1/properties?city=maiduguri&propertyType=apartment_building&page=1&limit=12&sort=newest
Example Successful Response
{
  "success": true,
  "data": {
    "properties": [
      {
        "id": "10000000-0000-4000-8000-000000000001",
        "slug": "demo-green-view-residence-10000000-000",
        "title": "Demo Green View Residence",
        "description": "A demonstration verified rental property used to test the public catalogue.",
        "propertyType": "apartment_building",
        "verificationStatus": "verified",
        "location": {
          "countryCode": "NG",
          "stateRegion": "Borno",
          "city": "Maiduguri",
          "area": "Bolori",
          "approximateLatitude": 11.847,
          "approximateLongitude": 13.157,
          "isLocationVerified": true
        },
        "startingPrices": [
          {
            "amount": 300000,
            "currency": "NGN",
            "billingPeriod": "yearly"
          }
        ],
        "availableUnitCount": 1,
        "coverMedia": null,
        "createdAt": "2026-08-25T23:00:21.06704+00:00",
        "updatedAt": "2026-08-25T23:00:21.06704+00:00"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 12,
      "totalItems": 1,
      "totalPages": 1,
      "hasNextPage": false,
      "hasPreviousPage": false
    }
  }
}
Empty Result

A valid request with no matching property returns a successful response with an empty collection.

Example:

GET /api/v1/properties?city=Abuja

Response:

{
  "success": true,
  "data": {
    "properties": [],
    "pagination": {
      "page": 1,
      "limit": 12,
      "totalItems": 0,
      "totalPages": 0,
      "hasNextPage": false,
      "hasPreviousPage": false
    }
  }
}

An empty result is not treated as a server error.

Starting-Price Rule

startingPrices is an array containing the lowest base rent among currently available units for each unique combination of:

Currency
Billing period

For example, these prices must not be compared as ordinary numbers:

NGN 25000 monthly
NGN 300000 yearly
USD 500 monthly

They represent different currencies or billing periods and therefore remain separate.

startingPrices does not represent the complete amount payable. The property-detail endpoint shows additional fees separately.

Cover Media Limitation

The list endpoint currently returns:

{
  "coverMedia": null
}

Cloudinary delivery has not yet been implemented. The API does not generate placeholder or fake media URLs.

2. Get Public Property Details
Endpoint
GET /api/v1/properties/:slug
Purpose

Returns the public details of one published and verified property.

Slug Validation

A valid property slug:

Is required
May contain lowercase letters
May contain numbers
May contain single hyphens between segments
Cannot exceed 170 characters

Valid example:

demo-green-view-residence-10000000-000

Invalid examples:

Demo Property
../../../private-file
property<script>
Example Request
GET /api/v1/properties/demo-green-view-residence-10000000-000
Example Successful Response
{
  "success": true,
  "data": {
    "property": {
      "id": "10000000-0000-4000-8000-000000000001",
      "slug": "demo-green-view-residence-10000000-000",
      "title": "Demo Green View Residence",
      "description": "A demonstration verified rental property used to test the public catalogue.",
      "propertyType": "apartment_building",
      "verificationStatus": "verified",
      "location": {
        "countryCode": "NG",
        "stateRegion": "Borno",
        "city": "Maiduguri",
        "area": "Bolori",
        "approximateLatitude": 11.847,
        "approximateLongitude": 13.157,
        "isLocationVerified": true
      },
      "amenities": [
        {
          "id": "amenity-uuid",
          "name": "Running Water",
          "slug": "running-water",
          "category": "utilities",
          "description": "Regular water supply is available.",
          "allowedScope": "both"
        }
      ],
      "units": [
        {
          "id": "20000000-0000-4000-8000-000000000001",
          "unitName": "Demo Self-contained Unit",
          "unitType": "self_contained",
          "description": "A demonstration unit with private facilities.",
          "bedrooms": 1,
          "bathrooms": 1,
          "maximumOccupants": 2,
          "baseRent": {
            "amount": 300000,
            "currency": "NGN",
            "billingPeriod": "yearly"
          },
          "availability": {
            "status": "available",
            "availableFrom": "2026-08-25"
          },
          "fees": [
            {
              "id": "fee-uuid",
              "feeType": "caution",
              "feeName": "Refundable caution deposit",
              "description": "Refundable according to the tenancy conditions.",
              "amount": 30000,
              "currency": "NGN",
              "paymentFrequency": "one_time",
              "isMandatory": true,
              "isRefundable": true
            }
          ],
          "amenities": [
            {
              "id": "amenity-uuid",
              "name": "Wardrobe",
              "slug": "wardrobe",
              "category": "interior",
              "description": "A wardrobe is available.",
              "allowedScope": "unit"
            }
          ]
        }
      ],
      "media": [
        {
          "id": "30000000-0000-4000-8000-000000000001",
          "unitId": null,
          "mediaType": "image",
          "mediaCategory": "exterior",
          "url": null,
          "format": "jpg",
          "widthPixels": 1200,
          "heightPixels": 800,
          "durationSeconds": null,
          "altText": "Demonstration exterior view of Green View Residence",
          "displayOrder": 0,
          "isCover": true,
          "capturedAt": "2026-08-25T23:00:21.06704+00:00",
          "verifiedAt": "2026-08-25T23:00:21.06704+00:00"
        }
      ],
      "createdAt": "2026-08-25T23:00:21.06704+00:00",
      "updatedAt": "2026-08-25T23:00:21.06704+00:00"
    }
  }
}

UUIDs and timestamps in examples are illustrative unless they match the current demonstration database.

Pricing-Transparency Rule

The API keeps the following values distinct:

Base rent
Mandatory one-time fees
Mandatory recurring fees
Optional fees
Refundable fees
Non-refundable fees
Declared agent fees

Fees with different payment frequencies must not be combined into one unexplained total.

Media Limitation

Media metadata is returned only when database permissions and RLS allow it.

The public response excludes:

Storage provider configuration
Storage keys
Upload credentials
Uploader identifiers
Verification administrator identifiers
Rejection reasons

The url field currently remains:

null

Cloudinary delivery will be implemented separately.

3. List Amenities
Endpoint
GET /api/v1/amenities
Purpose

Returns active amenities that may be used by public interfaces and future property forms.

Example Response
{
  "success": true,
  "data": {
    "amenities": [
      {
        "name": "Running Water",
        "slug": "running-water",
        "category": "utilities",
        "description": "Regular water supply is available.",
        "allowedScope": "both"
      }
    ]
  }
}

Only amenities with:

is_active = true

may be returned.

Validation Errors
Invalid Query Parameters

Example:

GET /api/v1/properties?propertyType=hotel

Response:

{
  "success": false,
  "error": {
    "code": "INVALID_QUERY_PARAMETERS",
    "message": "One or more query parameters are invalid.",
    "details": [
      {
        "field": "propertyType",
        "message": "Invalid option"
      }
    ]
  }
}

The exact Zod message may vary with the installed Zod version, but the public error code and response structure remain controlled.

Invalid Property Slug

Response:

{
  "success": false,
  "error": {
    "code": "INVALID_PROPERTY_SLUG",
    "message": "Property slug has an invalid format."
  }
}
Property Not Found

A nonexistent, unpublished, unverified or otherwise inaccessible property returns:

{
  "success": false,
  "error": {
    "code": "PROPERTY_NOT_FOUND",
    "message": "The requested property was not found."
  }
}

The public API intentionally does not distinguish between:

A property that does not exist
A draft property
An unpublished property
An unverified property
A property the visitor is not permitted to read

This prevents private-resource enumeration.

HTTP Status Codes
Status	Meaning
200	Request completed successfully
400	Query parameters or property slug are invalid
404	Property does not exist or is not publicly accessible
429	Too many requests
500	Unexpected internal server error

Internal errors must be logged safely by the server and represented to visitors using a controlled response.

Security Boundary

The current request flow is:

Visitor
  → React frontend or API client
  → Express route
  → Controller
  → Zod validation
  → Service
  → Supabase client using the publishable key
  → PostgreSQL column permissions and Row Level Security
  → Controlled public response

Security does not depend on one application layer.

The public catalogue is protected by:

Explicit database column grants
PostgreSQL Row Level Security
A Supabase publishable key
Explicit field selection
Zod input validation
Service-layer response transformation
Controlled error responses
Rate limiting
CORS
Security headers

The Express backend must never use unrestricted select * queries for public catalogue endpoints.

Data Projection

Data projection means returning only the fields required by the public client.

For example, the database may contain:

Exact location
Provider identifier
Uploader identifier
Media storage key
Verification administrator
Rejection reason

The public response excludes those fields even when they exist in the database.

Database permissions, RLS and API projection work together as defence in depth.

Current Limitations

The current public catalogue does not yet support:

Free-text search
Unit-type filtering
Minimum-rent filtering
Maximum-rent filtering
Currency filtering
Billing-period filtering
Bedroom filtering
Bathroom filtering
Amenity filtering
Availability-date filtering
Rent-based sorting
Cloudinary media URLs
Public virtual-tour endpoints
Google Maps integration
Automated API tests

These features must not be advertised as implemented until their code, database permissions, tests and documentation are complete.

Planned Enhancements

Possible future enhancements include:

Free-text property search
Advanced unit and price filters
Amenity filters
Availability filters
Stable secondary sorting
Signed or transformed Cloudinary delivery URLs
Approved virtual-tour retrieval
Map-based catalogue browsing
Automated integration and privacy tests
```
