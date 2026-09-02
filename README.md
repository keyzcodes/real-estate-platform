# Real Estate Platform

A transparency-first rental-property platform designed to help property seekers discover verified listings, understand the real cost of renting and reduce hidden or inflated agent fees.

## Project Status

The project is under active development.

Latest completed milestones:

```text
Public property catalogue backend implemented and merged through Pull Request #1
Sprint 1 closeout documentation merged through Pull Request #2
Automated public catalogue testing foundation merged through Pull Request #3
```

The catalogue supports secure public property discovery, property details, pagination, validated filters, approximate locations, amenities and transparent rental fees.

Automated coverage now protects the catalogue through Jest unit tests, Supertest API tests, recursive privacy-contract assertions, PostgreSQL pgTAP tests, Row Level Security visibility tests and GitHub Actions.

## Problem

Property seekers commonly experience:

- Hidden or inflated agent fees
- Misleading property information
- Inaccurate locations
- Outdated availability
- Undisclosed additional charges
- Difficulty inspecting properties remotely
- Unverified property providers
- Privacy and safety risks around property locations

## Solution

The platform is being designed to provide:

- Verified property listings
- Transparent base rent
- Separately disclosed additional fees
- Approximate public locations
- Protected exact locations
- Property photos and videos
- Unit availability information
- Property and unit amenities
- Clear provider identification
- Remote property evaluation
- Inaccurate-listing reports
- Direct provider contact in a later phase

## Phase 1 MVP

The first release focuses on property discovery around UNIMAID and Maiduguri while maintaining a structure that can expand to other locations.

## Implemented Features

### Project Foundation

- React frontend foundation using Vite
- Express backend foundation
- Modular backend structure
- Supabase PostgreSQL connection
- Environment-variable configuration
- API versioning
- CORS configuration
- Security headers
- Request rate limiting
- Controlled error responses
- Git feature-branch workflow

### Database

- Profiles and user roles
- Properties
- Protected property locations
- Property units
- Transparent unit fees
- Property and unit amenities
- Property media
- Virtual-tour data model
- Foreign-key relationships
- Database constraints
- Indexes
- Triggers
- Row Level Security
- Column-level permissions
- Forward-only migrations
- Reusable demonstration seed data

### Public Catalogue API

- Paginated public property list
- Public property-detail endpoint
- Country filtering
- State or region filtering
- City filtering
- Area filtering
- Property-type filtering
- Newest and oldest sorting
- Zod query validation
- Property-slug validation
- Approximate public locations
- Transparent base rent and additional fees
- Property and unit amenities
- Approved media metadata
- Safe public-data projection
- Privacy protection for exact locations and provider information

### Automated Testing

- Jest unit tests
- Supertest API tests
- Validation and error-response tests
- Service-layer transformation tests
- Grouped starting-price tests
- Recursive nested-field privacy assertions
- PostgreSQL permission tests using pgTAP
- Row Level Security activation tests
- Anonymous and authenticated row-visibility tests
- Controlled database fixtures
- Transactional fixture rollback
- GitHub Actions continuous integration

The automated-testing foundation was reviewed and merged through Pull Request #3.

## Current API Endpoints

### List public properties

```http
GET /api/v1/properties
```

Implemented query parameters:

| Parameter | Purpose |
| --------- | ------- |
| `page` | Select the results page |
| `limit` | Control the number of results per page |
| `country` | Filter by two-letter country code |
| `state` | Filter by state or region |
| `city` | Filter by city |
| `area` | Filter by local area |
| `propertyType` | Filter by an allowed property type |
| `sort` | Sort by newest or oldest |

Example:

```http
GET /api/v1/properties?city=maiduguri&propertyType=apartment_building&page=1&limit=12
```

### Get one public property

```http
GET /api/v1/properties/:slug
```

Example:

```http
GET /api/v1/properties/demo-green-view-residence-10000000-000
```

### List active amenities

```http
GET /api/v1/amenities
```

Complete API documentation:

```text
docs/api/public-catalog-api.md
```

## Pricing Transparency

The platform keeps base rent separate from additional fees.

Each fee may record:

- Fee type
- Fee name
- Description
- Amount
- Currency
- Payment frequency
- Mandatory status
- Refundable status

Catalogue starting prices are grouped by currency and billing period.

For example, monthly and yearly rent are not compared as ordinary numbers because they represent different payment obligations.

## Location Privacy

The public catalogue may return:

- Country
- State or region
- City
- General area
- Approximate latitude
- Approximate longitude
- Location-verification status

The public catalogue must not return:

- Exact street address
- Exact latitude
- Exact longitude
- Provider identity
- Administrator identity
- Private location-capture information

Exact locations remain protected for future controlled disclosure.

## Security Model

The public request flow is:

```text
Visitor
  → React frontend or API client
  → Express route
  → Controller
  → Zod validation
  → Service
  → Supabase publishable key
  → PostgreSQL permissions and Row Level Security
  → Controlled public response
```

Security is enforced through:

- Supabase publishable-key access
- PostgreSQL column permissions
- Row Level Security
- Explicit field selection
- Input validation
- Service-layer response transformation
- Recursive privacy-contract tests
- Controlled error responses
- Rate limiting
- CORS
- Security headers
- Automated continuous-integration checks

Public endpoints must not use unrestricted `SELECT *` queries.

## Automated Testing

### Application tests

From the project root:

```powershell
npm --prefix backend test
```

The application suite contains eight Jest and Supertest tests covering:

- Public catalogue responses
- Request validation
- Slug validation
- Controlled errors
- Service transformations
- Starting-price calculations
- Nested privacy-field detection

### Database tests

Database tests use PostgreSQL and pgTAP in an isolated Supabase environment.

They verify:

- RLS activation
- Public column permissions
- Exact-location restrictions
- Ownership-field restrictions
- Published-property visibility
- Draft-property privacy
- Pending-property privacy
- Anonymous and authenticated access boundaries

The database tests use controlled fixtures and finish with `rollback` so temporary test records do not persist.

The current workstation does not provide the required local container environment. Database tests therefore run primarily through GitHub Actions.

Automated tests must never connect to or modify the production database.

## Technology Stack

### Frontend

- React
- Vite
- CSS
- React Router

### Backend

- Node.js
- Express
- Zod
- Supabase JavaScript client

### Database and Authentication

- Supabase
- PostgreSQL
- Supabase Auth
- Row Level Security
- pgTAP

### Testing

- Jest
- Supertest
- pgTAP
- GitHub Actions

### Development Tools

- Git
- GitHub
- Supabase CLI
- Nodemon
- PowerShell

### Planned External Services

- Cloudinary
- Google Maps
- Transactional email service

Cloudinary and Google Maps are planned integrations and are not yet implemented.

## Project Structure

```text
real-estate-platform/
├── .github/
│   └── workflows/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── constants/
│   │   ├── controllers/
│   │   ├── database/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── repositories/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   └── validators/
│   └── tests/
│       ├── api/
│       ├── helpers/
│       └── services/
├── docs/
│   ├── api/
│   ├── architecture/
│   ├── database/
│   ├── requirements/
│   ├── security/
│   └── sprints/
├── frontend/
├── supabase/
│   ├── migrations/
│   ├── tests/
│   │   └── database/
│   └── seed.sql
├── CHANGELOG.md
├── README.md
└── SECURITY.md
```

## Local Development

### Prerequisites

Install:

- Node.js
- npm
- Git
- Supabase CLI when database migration work is required
- A Docker-compatible container runtime when running Supabase database tests locally

### Clone the Repository

```powershell
git clone https://github.com/keyzcodes/real-estate-platform.git
cd real-estate-platform
```

### Backend Setup

```powershell
cd backend
npm install
```

Create the backend environment file from the provided example and add the required Supabase values.

Do not commit the real `.env` file.

Start the backend:

```powershell
npm run dev
```

The development API is expected at:

```text
http://localhost:5000/api/v1
```

### Run Application Tests

From the project root:

```powershell
npm --prefix backend test
```

Alternatively, from the `backend` directory:

```powershell
npm test
```

### Frontend Setup

From the project root:

```powershell
cd frontend
npm install
npm run dev
```

Use the URL displayed by Vite.

## Database Migrations

Preview pending remote migrations:

```powershell
npx supabase db push --dry-run
```

Apply reviewed migrations:

```powershell
npx supabase db push
```

Applied migrations must not be rewritten. Corrections must be introduced through newer forward-only migrations.

## Seed Data

Reusable demonstration content is stored in:

```text
supabase/seed.sql
```

Seed data is separate from structural migrations.

The demonstration listing is intended for development and testing and must not be represented as a genuine rental property.

Automated database tests use their own controlled fixtures instead of depending on ordinary development seed data.

## Documentation

### Requirements

```text
docs/requirements/product-requirements.md
```

### System Architecture

```text
docs/architecture/system-architecture.md
```

### Architecture Decisions

```text
docs/architecture/decisions/
```

### Database Design

```text
docs/database/
```

### API Contract

```text
docs/api/public-catalog-api.md
```

### Sprint Records

```text
docs/sprints/
```

## Development Workflow

Features are developed on dedicated branches.

Typical workflow:

```text
Create feature branch
  → Implement
  → Validate
  → Document
  → Test
  → Commit
  → Push
  → Open Pull Request
  → Automated checks
  → Review
  → Merge into main
```

Do not merge an incomplete, failing or unreviewed feature directly into `main`.

## Current Limitations

The project does not yet include:

- Completed public catalogue frontend
- Cloudinary media delivery URLs
- Google Maps integration
- Provider onboarding
- Administrator dashboard
- Property-management API
- Browser end-to-end tests
- Public virtual-tour endpoint
- Controlled exact-location disclosure
- Booking
- Payments

## Roadmap

### Next

- Complete and merge the Sprint 2 closeout documentation
- Define the Sprint 3 frontend catalogue requirements
- Design public property cards and property-detail pages
- Connect the React frontend to the Express catalogue API
- Implement loading, empty and error states
- Add frontend component and integration tests
- Maintain responsive and accessible layouts

### Later

- Integrate Cloudinary media delivery
- Integrate map-based property discovery
- Add administrator property management
- Add provider onboarding
- Add verified provider contact
- Add reports and moderation
- Add browser end-to-end tests
- Add the public virtual-tour experience
- Add booking and payment capabilities
- Expand beyond Maiduguri