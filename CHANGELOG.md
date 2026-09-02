# Changelog

## Purpose

This file maintains a chronological record of notable features, changes, fixes and security improvements made to the Real Estate Platform.

It helps developers, reviewers and future contributors understand how the project has evolved without reading every commit or sprint document.

This file records project-level changes. Detailed implementation reasoning remains in the sprint records and Architecture Decision Records.

The format follows the principles of [Keep a Changelog](https://keepachangelog.com/en/1.1.0/). Version numbers will follow [Semantic Versioning](https://semver.org/) when formal releases begin..

## [Unreleased]

### Added

#### Project foundation

- Created the React frontend foundation with Vite.
- Created the Express backend foundation.
- Added a modular backend directory structure.
- Connected the backend to Supabase PostgreSQL.
- Added environment-variable configuration.
- Added API versioning under `/api/v1`.
- Added CORS configuration.
- Added security headers.
- Added request rate limiting.
- Added controlled error responses.
- Added project requirements, architecture, database and security documentation.
- Added Git and GitHub feature-branch workflow.

#### Database

- Added profiles and role-management structures.
- Added properties and protected property locations.
- Added rentable property units.
- Added transparent unit fees.
- Added property-level and unit-level amenities.
- Added property media structures.
- Added virtual-tour database structures.
- Added database constraints, indexes and triggers.
- Added Row Level Security policies.
- Added restricted public column permissions.
- Added forward-only Supabase migrations.
- Added reusable demonstration seed data.

#### Public property catalogue

- Added `GET /api/v1/properties`.
- Added `GET /api/v1/properties/:slug`.
- Added public catalogue pagination.
- Added country filtering.
- Added state or region filtering.
- Added city filtering.
- Added area filtering.
- Added property-type filtering.
- Added newest and oldest sorting.
- Added Zod query validation.
- Added property-slug allowlist validation.
- Added approximate public locations.
- Added grouped `startingPrices`.
- Added available-unit counts.
- Added property-detail retrieval.
- Added property and unit amenities to public details.
- Added transparent base rent and unit-fee responses.
- Added approved media metadata.
- Added consistent invalid-query, invalid-slug and property-not-found responses.
- Added resource-enumeration protection for inaccessible properties.

#### Documentation

- Closed and updated Sprint 0 documentation.
- Added the Sprint 1 public-property-catalogue record.
- Updated the public catalogue API contract.
- Added ADR-005 for public location privacy.
- Added ADR-006 for transparent rental pricing.
- Added ADR-007 for public API security and forward-only migrations.
- Updated the project README with current implementation status.

### Changed

- Changed catalogue pricing from one `startingPrice` object to a `startingPrices` array grouped by currency and billing period.
- Changed public location responses to expose approximate coordinates instead of exact coordinates.
- Separated demonstration data from structural database migrations.
- Structured the property API using route, controller, service and validator layers.
- Documented Cloudinary and Google Maps as planned integrations rather than implemented features.

### Fixed

- Added missing public read permissions and Row Level Security for `unit_fees`.
- Corrected Supabase environment-variable configuration.
- Corrected PowerShell staging commands to run from the repository root.
- Removed unsupported filters and sorting options from the implemented API contract.
- Removed broken text-encoding characters from updated documentation.

### Security

- Restricted public catalogue access to published and verified properties.
- Restricted public media access to approved records.
- Protected exact street addresses and exact GPS coordinates.
- Protected provider and administrator identifiers.
- Used a Supabase publishable key so Row Level Security remains active.
- Added explicit field selection instead of unrestricted public `SELECT *` queries.
- Added validation before public database queries.
- Returned the same public `404` response for nonexistent and inaccessible properties.
- Prevented internal database errors and stack traces from being returned to visitors.

## Release Notes

No stable public release has been created yet.

The public property catalogue remains under final documentation, regression testing, privacy testing and Pull Request review.

#### Automated testing

- Added Jest unit tests for public catalogue application logic.
- Added Supertest coverage for public property API routes and controllers.
- Added validation, response-contract and sanitised-error tests.
- Added reusable recursive assertions that detect forbidden fields inside nested public responses.
- Added service tests for property transformation and grouped starting prices.
- Added 19 pgTAP assertions for catalogue permissions and structural database security.
- Added eight pgTAP assertions for anonymous and authenticated RLS row visibility.
- Added controlled property, location, unit and media test fixtures.
- Added transactional rollback to prevent test fixtures from persisting.
- Added GitHub Actions jobs for application and PostgreSQL security tests.
- Added ADR-008 documenting the automated-testing strategy.
- Merged the automated-testing foundation into `main` through Pull Request #3.