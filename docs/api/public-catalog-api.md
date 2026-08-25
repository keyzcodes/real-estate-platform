# Public Property Catalogue API

## Project

Real Estate Platform

## Purpose

This document defines the public API used by visitors to browse verified rental properties without exposing private property, provider or administrative information.

## Base URL

`/api/v1`

The `/v1` prefix allows future API changes without immediately breaking existing clients.

---

## Public Catalogue Rules

A property may appear publicly only when:

* `publication_status = published`
* `verification_status = verified`

Property media may appear publicly only when:

* `verification_status = approved`

The public API must never return:

* Exact street addresses
* Exact GPS coordinates
* Provider profile identifiers
* Provider phone numbers or email addresses
* Administrative identifiers
* Verification documents
* Media rejection reasons
* Pending, rejected, unpublished or archived properties
* Pending or rejected media
* Cloudinary credentials or private configuration

---

## Standard Success Response

```json
{
  "success": true,
  "data": {}
}
```

## Standard Error Response

```json
{
  "success": false,
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "The requested property was not found."
  }
}
```

Internal database errors, SQL statements and stack traces must never be returned to visitors.

---

## 1. List Properties

### Endpoint

`GET /api/v1/properties`

### Purpose

Returns a paginated list of published and verified properties.

### Supported Query Parameters

| Parameter       | Example             | Purpose                           |
| --------------- | ------------------- | --------------------------------- |
| `search`        | `green view`        | Search title, city or area        |
| `country`       | `NG`                | Filter by country code            |
| `state`         | `Borno`             | Filter by state or region         |
| `city`          | `Maiduguri`         | Filter by city                    |
| `area`          | `Mairi`             | Filter by general area            |
| `propertyType`  | `hostel`            | Filter by property type           |
| `unitType`      | `self_contained`    | Filter by unit type               |
| `minRent`       | `100000`            | Minimum base rent                 |
| `maxRent`       | `500000`            | Maximum base rent                 |
| `currency`      | `NGN`               | Currency used for price filtering |
| `billingPeriod` | `yearly`            | Monthly, quarterly or yearly      |
| `bedrooms`      | `1`                 | Minimum bedroom count             |
| `bathrooms`     | `1`                 | Minimum bathroom count            |
| `amenities`     | `electricity,wi-fi` | Required amenity slugs            |
| `availableFrom` | `2026-09-01`        | Required availability date        |
| `sort`          | `newest`            | Result ordering                   |
| `page`          | `1`                 | Page number                       |
| `limit`         | `12`                | Results per page                  |

### Allowed Sort Values

* `newest`
* `oldest`
* `rent_low_to_high`
* `rent_high_to_low`

### Pagination Rules

* Default page: `1`
* Default limit: `12`
* Maximum limit: `50`
* Negative or invalid values must be rejected.
* Unlimited public queries are not allowed.

### Example Request

`GET /api/v1/properties?city=Maiduguri&propertyType=hostel&currency=NGN&billingPeriod=yearly&minRent=100000&maxRent=400000&page=1&limit=12`

### Example Response

```json
{
  "success": true,
  "data": {
    "properties": [
      {
        "id": "property-uuid",
        "slug": "green-view-hostel-a42f91bc-17d",
        "title": "Green View Hostel",
        "description": "Verified accommodation with reliable utilities.",
        "propertyType": "hostel",
        "location": {
          "countryCode": "NG",
          "stateRegion": "Borno",
          "city": "Maiduguri",
          "area": "Mairi",
          "approximateLatitude": 11.848,
          "approximateLongitude": 13.152,
          "isLocationVerified": true
        },
        "coverMedia": {
          "id": "media-uuid",
          "mediaType": "image",
          "url": "https://res.cloudinary.com/example/image/upload/example.jpg",
          "altText": "Exterior view of Green View Hostel"
        },
        "startingPrice": {
          "amount": 300000,
          "currency": "NGN",
          "billingPeriod": "yearly"
        },
        "availableUnitCount": 3,
        "createdAt": "2026-08-25T14:00:00Z",
        "updatedAt": "2026-08-25T14:00:00Z"
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
```

### Catalogue Price Rule

`startingPrice` represents the lowest base rent among currently available units.

It does not represent the complete payable amount. Property details must show every additional fee separately.

---

## 2. Get Property Details

### Endpoint

`GET /api/v1/properties/:slug`

### Purpose

Returns complete public information for one published and verified property.

### Example Request

`GET /api/v1/properties/green-view-hostel-a42f91bc-17d`

### Response Information

The response may include:

* Property title and description
* Property type
* General location
* Approximate map coordinates
* Verification status
* Available and unavailable units
* Base rent for every unit
* Mandatory and optional fees
* Property amenities
* Unit amenities
* Approved photos and videos
* Approved virtual-tour information
* Media capture and verification dates

### Example Unit Pricing

```json
{
  "id": "unit-uuid",
  "unitName": "Room A12",
  "unitType": "self_contained",
  "description": "Private self-contained room.",
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
    "availableFrom": "2026-09-01"
  },
  "fees": [
    {
      "feeType": "caution",
      "feeName": "Refundable caution deposit",
      "description": "Refundable subject to the tenancy conditions.",
      "amount": 30000,
      "currency": "NGN",
      "paymentFrequency": "one_time",
      "isMandatory": true,
      "isRefundable": true
    },
    {
      "feeType": "service",
      "feeName": "Maintenance charge",
      "description": "Supports cleaning and shared-area maintenance.",
      "amount": 5000,
      "currency": "NGN",
      "paymentFrequency": "monthly",
      "isMandatory": true,
      "isRefundable": false
    }
  ]
}
```

### Pricing Transparency Rule

Fees with different frequencies must not be combined into one unexplained total.

The frontend must distinguish between:

* Base rent
* Mandatory one-time fees
* Mandatory recurring fees
* Optional fees
* Refundable fees
* Declared agent fees

---

## 3. List Amenities

### Endpoint

`GET /api/v1/amenities`

### Purpose

Returns active amenities for search filters and property forms.

### Example Response

```json
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
```

Only amenities with `is_active = true` may be returned.

---

## 4. Public Virtual Tour

### Endpoint

`GET /api/v1/properties/:slug/tours/:tourId`

### Purpose

Returns an approved virtual tour, its approved panorama scenes and navigation hotspots.

The endpoint must not return:

* Unapproved panorama media
* Internal storage configuration
* Administrative or uploader identifiers
* Rejection reasons

---

## Validation Rules

The backend must:

* Validate all query parameters.
* Reject unsupported property and unit types.
* Reject negative prices.
* Require a valid three-letter currency code.
* Limit the number of amenities accepted in one query.
* Limit search-text length.
* Prevent uncontrolled sorting fields.
* Apply pagination to every list request.
* Use parameterised database queries.

---

## Security Boundary

The React frontend must not directly query private catalogue tables.

Request flow:

`Visitor → React frontend → Express API → Supabase PostgreSQL → Express removes private fields → Safe response returned`

Database Row Level Security remains enabled as an additional security layer.

The Express backend must return only explicitly selected safe fields. It must never use unrestricted `select *` queries for public endpoints.
