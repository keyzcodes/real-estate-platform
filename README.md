# Real Estate Platform

A transparency-first rental-property platform designed to help property seekers discover verified listings, understand the real cost of renting and reduce hidden or inflated agent fees.

## Project Status

The project is under active development.

Current milestone:

      text
Public property catalogue backend implemented
Documentation and Pull Request review in progress

Current feature branch:

feature/public-property-catalogue

The public catalogue feature has not yet been merged into main.

Problem

Property seekers commonly experience:

Hidden or inflated agent fees
Misleading property information
Inaccurate locations
Outdated availability
Undisclosed additional charges
Difficulty inspecting properties remotely
Unverified property providers
Privacy and safety risks around property locations
Solution

The platform is being designed to provide:

Verified property listings
Transparent base rent
Separately disclosed additional fees
Approximate public locations
Protected exact locations
Property photos and videos
Unit availability information
Property and unit amenities
Clear provider identification
Remote property evaluation
Inaccurate-listing reports
Direct provider contact in a later phase
Phase 1 MVP

The first release focuses on property discovery around UNIMAID and Maiduguri while maintaining a structure that can expand to other locations.

Implemented Features
Project Foundation
React frontend foundation using Vite
Express backend foundation
Modular backend structure
Supabase PostgreSQL connection
Environment-variable configuration
API versioning
CORS configuration
Security headers
Request rate limiting
Controlled error responses
Git feature-branch workflow
Database
Profiles and user roles
Properties
Protected property locations
Property units
Transparent unit fees
Property and unit amenities
Property media
Virtual-tour data model
Foreign-key relationships
Database constraints
Indexes
Triggers
Row Level Security
Column-level permissions
Forward-only migrations
Reusable demonstration seed data
Public Catalogue API
Paginated public property list
Public property-detail endpoint
Country filtering
State or region filtering
City filtering
Area filtering
Property-type filtering
Newest and oldest sorting
Zod query validation
Property-slug validation
Approximate public locations
Transparent base rent and additional fees
Property and unit amenities
Approved media metadata
Safe public-data projection
Privacy protection for exact locations and provider information
Current API Endpoints
List public properties
GET /api/v1/properties

Implemented query parameters:

page
limit
country
state
city
area
propertyType
sort

Example:

GET /api/v1/properties?city=maiduguri&propertyType=apartment_building&page=1&limit=12
Get one public property
GET /api/v1/properties/:slug

Example:

GET /api/v1/properties/demo-green-view-residence-10000000-000
List active amenities
GET /api/v1/amenities

Complete API documentation:

docs/api/public-catalog-api.md
Pricing Transparency

The platform keeps base rent separate from additional fees.

Each fee may record:

Fee type
Fee name
Description
Amount
Currency
Payment frequency
Mandatory status
Refundable status

Catalogue starting prices are grouped by currency and billing period.

For example, monthly and yearly rent are not compared as ordinary numbers because they represent different payment obligations.

Location Privacy

The public catalogue may return:

Country
State or region
City
General area
Approximate latitude
Approximate longitude
Location-verification status

The public catalogue must not return:

Exact street address
Exact latitude
Exact longitude
Provider identity
Administrator identity
Private location-capture information

Exact locations remain protected for future controlled disclosure.

Security Model

The public request flow is:

Visitor
  → React frontend or API client
  → Express route
  → Controller
  → Zod validation
  → Service
  → Supabase publishable key
  → PostgreSQL permissions and Row Level Security
  → Controlled public response

Security is enforced through:

Supabase publishable-key access
PostgreSQL column permissions
Row Level Security
Explicit field selection
Input validation
Service-layer response transformation
Controlled error responses
Rate limiting
CORS
Security headers

Public endpoints must not use unrestricted SELECT * queries.

Technology Stack
Frontend
React
Vite
CSS
React Router
Backend
Node.js
Express
Zod
Supabase JavaScript client
Database and Authentication
Supabase
PostgreSQL
Supabase Auth
Row Level Security
Development Tools
Git
GitHub
Supabase CLI
Nodemon
PowerShell
Planned External Services
Cloudinary
Google Maps
Transactional email service

Cloudinary and Google Maps are planned integrations and are not yet implemented.

Project Structure
real-estate-platform/
├── backend/
│   └── src/
│       ├── config/
│       ├── constants/
│       ├── controllers/
│       ├── database/
│       ├── middleware/
│       ├── models/
│       ├── repositories/
│       ├── routes/
│       ├── services/
│       ├── tests/
│       ├── utils/
│       └── validators/
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
│   └── seed.sql
├── CHANGELOG.md
├── README.md
└── SECURITY.md
Local Development
Prerequisites

Install:

Node.js
npm
Git
Supabase CLI when database migration work is required
Clone the Repository
git clone https://github.com/keyzcodes/real-estate-platform.git
cd real-estate-platform
Backend Setup
cd backend
npm install

Create the backend environment file from the provided example and add the required Supabase values.

Do not commit the real .env file.

Start the backend:

npm run dev

The development API is expected at:

http://localhost:5000/api/v1
Frontend Setup

From the project root:

cd frontend
npm install
npm run dev

Use the URL displayed by Vite.

Database Migrations

Preview pending remote migrations:

npx supabase db push --dry-run

Apply reviewed migrations:

npx supabase db push

Applied migrations must not be rewritten. Corrections must be introduced using newer forward-only migrations.

Seed Data

Reusable demonstration content is stored in:

supabase/seed.sql

Seed data is separate from structural migrations.

The demonstration listing is intended for development and testing and must not be represented as a real rental property.

Documentation
Requirements
docs/requirements/product-requirements.md
System Architecture
docs/architecture/system-architecture.md
Architecture Decisions
docs/architecture/decisions/
Database Design
docs/database/
API Contract
docs/api/public-catalog-api.md
Sprint Records
docs/sprints/
Development Workflow

Features are developed on dedicated branches.

Typical workflow:

Create feature branch
  → Implement
  → Validate
  → Document
  → Test
  → Commit
  → Push
  → Open Pull Request
  → Review
  → Merge into main

Do not merge an incomplete or unreviewed feature directly into main.

Current Limitations

The project does not yet include:

Completed public catalogue frontend
Cloudinary media delivery URLs
Google Maps
Provider onboarding
Administrator dashboard
Property-management API
Booking
Payments
Automated API test suite
Public virtual-tour endpoint
Controlled exact-location disclosure
Roadmap
Next
Complete public catalogue documentation
Run final regression and privacy tests
Open and review the first feature Pull Request
Merge the public catalogue feature into main
Later
Build the public catalogue interface
Integrate Cloudinary media delivery
Integrate map-based property discovery
Add administrator property management
Add provider onboarding
Add verified provider contact
Add reports and moderation
Add automated integration tests
Add booking and payment capabilities
Expand beyond Maiduguri