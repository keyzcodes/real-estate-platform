# ADR-008 — Automated Testing Strategy

## Status

Accepted

## Date

1 September 2026

## Decision Owner

Sunday Jime

## Context

The public property catalogue currently depends on:

- Express routes and controllers
- Zod request validation
- Service-layer data transformation
- Supabase PostgreSQL
- PostgreSQL column permissions
- Row Level Security policies
- A documented public API response contract

Manual testing confirmed the initial implementation, but repeated manual requests are slow and can miss regressions.

The automated test strategy must detect:

- Broken routes or response structures
- Invalid input being accepted
- Private properties becoming publicly readable
- Sensitive columns becoming accessible
- Sensitive fields appearing anywhere inside nested JSON
- Internal errors being exposed publicly
- Database migrations or security policies behaving incorrectly

Tests must remain deterministic and must not depend on production data, production credentials, network availability or records created during ordinary development.

## Decision

Sprint 2 will use three complementary automated testing layers:

1. Unit tests using Jest
2. API tests using Jest and Supertest
3. Database security tests using pgTAP against a disposable Supabase/PostgreSQL stack running either on a Docker-capable workstation or in GitHub Actions

Each layer proves a different part of the system.

No automated test will connect to or modify the production database.

## Testing Architecture

```text
                    Sprint 2
                        |
                Automated testing
                        |
        +---------------+---------------+
        |               |               |
    Unit tests       API tests      Database security
       Jest       Jest + Supertest   pgTAP + Supabase
        |               |               |
        v               v               v
    Pure logic      Express API      PostgreSQL
                                    RLS and grants
Unit Tests

Jest will test isolated application logic without starting Express or connecting to Supabase.

Unit tests may cover:

Query validation
Property-slug validation
Starting-price grouping
Database-to-API field transformation
Recursive forbidden-field detection
Pagination calculations
Error transformation

Dependencies will be mocked or replaced with controlled values when necessary.

These tests should be fast, deterministic and independent of external services.

API Tests

Jest and Supertest will test the exported Express application without opening a real network port.

The database service will be mocked so each test can define its expected result.

API tests will verify:

HTTP status codes
Success-response structure
Error-response structure
Query validation
Slug validation
Empty catalogue behaviour
Property-not-found behaviour
Internal-error sanitisation
Public response contracts
Absence of forbidden fields from nested JSON

Mocked API tests prove application behaviour, but they do not prove that PostgreSQL permissions or RLS policies work.

Database Security Tests

Database tests will run against a disposable Supabase/PostgreSQL environment. GitHub Actions is the primary execution environment because the current development workstation does not provide a compatible container runtime. Developers with Docker-compatible environments may also run the same tests locally.

The GitHub Actions runner starts an isolated PostgreSQL database, applies the repository migrations, runs the pgTAP assertions and is discarded after the job. It receives no production database URL, password or API credentials.

They will use:

The migrations stored in supabase/migrations
pgTAP database tests
Controlled test fixtures
Local Supabase roles and security policies
Database reset or recreation between controlled test runs

The test environment must not depend on the demonstration property or any production record.

Database tests will verify:

RLS is enabled on protected tables
Published and verified properties are publicly readable
Draft properties are not publicly readable
Unverified properties are not publicly readable
Public fees are readable only through eligible properties
Private-property fees remain protected
Anonymous roles cannot read protected columns
Exact addresses remain protected
Exact coordinates remain protected
Provider and administrator identifiers remain protected
Media storage information remains protected
Migrations recreate the expected database security state

Database tests use a disposable local environment and controlled fixtures. The environment is reset or recreated so test records do not become part of persistent application data.

Controlled Test Fixtures

Database test records will be created specifically for the test suite.

Fixtures should include:

One published and verified property
One draft property
One unverified property
One available unit
One transparent public fee
One fee belonging to a private property
Approximate location information
Protected exact-location information
Approved media
Unapproved media
Public amenities

Fixture identifiers and expected values should be deterministic.

Tests must not assume that a particular development or production record already exists.

Privacy Contract Testing

Public API responses will be checked recursively for forbidden field names.

The forbidden-field list may include:

const forbiddenKeys = [
  "streetAddress",
  "exactLatitude",
  "exactLongitude",
  "createdBy",
  "providerId",
  "verifiedBy",
  "uploadedBy",
  "storageKey",
];

Recursive inspection ensures that a forbidden field causes a test failure even when it appears inside a nested object or array.

This protects against privacy regressions caused by future relational queries or response changes.

Defence in Depth

The test strategy verifies privacy at three boundaries.

Database boundary

Can the active PostgreSQL role access this row or column?

This is tested through RLS and column-permission tests.

Application boundary

Does the Express service deliberately transform database results into safe public objects?

This is tested through unit and API tests.

Contract boundary

Does the final JSON contain any field forbidden by the public API contract?

This is tested through recursive response inspection.

A passing API test does not replace an RLS test, and a passing RLS test does not replace an API response test.

Production-Environment Guard

Database test commands must fail before executing destructive or fixture-related operations when the configured database is not recognised as local.

The guard must reject:

Production Supabase URLs
Linked remote projects used as test targets
Production database connection strings
Missing or ambiguous test configuration

Local database tests must use local Supabase connection information generated by the local development stack.

Production credentials must not be stored in test configuration or committed to Git.

Test Commands

The backend will expose three test commands.

Application tests
npm test

Runs fast Jest unit and Supertest API tests without requiring a remote database.

Database security tests
npm run test:db

Runs Supabase/PostgreSQL and pgTAP security tests on a Docker-capable workstation. On the current workstation, the equivalent database suite runs through GitHub Actions.

Complete test suite
npm run test:all

Runs both the application and database-security test suites.

The exact number of tests will be determined by the documented requirements, security policies and API contract. The project will not create artificial tests merely to reach a particular test count.

## Continuous Integration

The repository uses `.github/workflows/automated-tests.yml`.

The workflow runs when:

- Changes are pushed to `test/public-catalogue-api`
- A Pull Request targets `main`
- A developer starts it manually through `workflow_dispatch`

The application-test job:

1. Checks out the repository
2. Installs Node.js 24
3. Installs exact dependencies using `npm ci`
4. Runs Jest and Supertest

The database-security job:

1. Checks out the repository
2. Installs the pinned Supabase CLI version
3. Temporarily disables the normal development seed
4. Starts a disposable PostgreSQL database
5. Applies the repository migrations
6. Runs the pgTAP tests

The development seed is disabled only inside the temporary CI runner because it requires an existing administrator profile. Database tests create their own controlled fixtures.

The workflow does not receive production credentials and must never use `--linked`, a production database URL or a production project reference.

Pull Requests must not be merged when a required automated-test job fails.

## Alternatives Considered
Test only through the deployed API

This was rejected because deployed tests would depend on network availability, remote configuration and persistent data.

It could also make failures difficult to reproduce locally.

Test against the production database

This was rejected because tests could read, modify or delete real information.

Production data is also unstable and unsuitable as a deterministic fixture source.

Test only with mocks

This was rejected because mocks cannot prove that real PostgreSQL grants, relationships and RLS policies behave correctly.

Test only with pgTAP

This was rejected because database tests do not fully verify Express routing, validation, error handling or final JSON response contracts.

Depend on development seed data

This was rejected because development seed content may change and does not necessarily represent every security state required by the tests.

Start by creating a fixed number of tests

This was rejected because test cases should be derived from requirements and risks rather than an arbitrary target number.

Consequences
Positive
Tests remain independent of production data.
Application tests remain fast and deterministic.
Real PostgreSQL security policies are tested.
Nested sensitive-field leaks can be detected.
Database and API privacy protections reinforce each other.
Failures can be reproduced locally.
The suite can later run in continuous integration.
Test fixtures describe the exact scenario being verified.
Negative
Local database testing requires Docker and the Supabase CLI.
The complete suite will be slower than Jest-only tests.
Fixtures and security tests require ongoing maintenance.
Developers must understand the difference between mocked and database-backed tests.
Local environment setup introduces additional configuration.
Privacy-field lists must be updated when the data model changes.
Required Initial Test Areas

Sprint 2 should initially cover:

Public property list
Public property details
Pagination
Filtering
Sorting
Query validation
Slug validation
Invalid country code
Invalid property type
Empty catalogue
Nonexistent property
Draft-property privacy
Unverified-property privacy
Exact-address protection
Exact-coordinate protection
Provider-identity protection
Administrator-identity protection
Uploader-identity protection
Storage-key protection
Internal-error sanitisation
Public response-contract validation
RLS enablement
Public fee access
Private fee protection

The final test count will depend on how these requirements are divided into focused test cases.

Future Review

This decision should be reviewed when the platform introduces:

Authenticated customer accounts
Provider and administrator APIs
Property creation and editing
Controlled exact-location disclosure
Booking and payments
Supabase Auth integration tests
Cloudinary media delivery
Google Maps integration
GitHub Actions
A dedicated staging environment
End-to-end frontend testing

Additional test layers should be introduced only when they protect a documented behaviour or meaningful risk.