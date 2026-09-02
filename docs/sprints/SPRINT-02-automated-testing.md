# Sprint 2 — Automated Public Catalogue Testing

## Sprint Information

| Item                | Value                                |
| ------------------- | ------------------------------------ |
| Sprint              | Sprint 2                             |
| Status              | Completed                            |
| Start date          | 1 September 2026                     |
| Completion date     | 2 September 2026                     |
| Developer           | Sunday Jime                          |
| Development process | Agile, iterative development         |
| Feature branch      | `test/public-catalogue-api`          |
| Target branch       | `main`                               |
| Pull Request        | Pull Request #3                      |

## Sprint Goal

Create a reliable automated-testing foundation for the public property catalogue.

The tests must detect broken API behaviour, invalid input, incorrect data transformations, privacy regressions and database-security failures before changes are merged into `main`.

## Problem Being Solved

Sprint 1 established working public property endpoints, but their behaviour was tested mainly through manual PowerShell requests.

Manual testing is useful during development, but it presents several limitations:

- Tests must be repeated manually after every change.
- A developer may forget an important case.
- Nested sensitive fields may be overlooked.
- Database permissions and RLS policies are difficult to verify manually.
- Results may depend on existing development data.
- A regression might reach `main` before it is discovered.

Sprint 2 introduced repeatable automated checks that run on the development branch and during Pull Request review.

## Testing Architecture

The automated-testing strategy uses three complementary layers:

| Layer             | Technology             | Responsibility |
| ----------------- | ---------------------- | -------------- |
| Unit tests        | Jest                   | Test isolated application logic |
| API tests         | Jest and Supertest     | Test Express routes, validation, responses and errors |
| Database tests    | PostgreSQL and pgTAP   | Test permissions, RLS and row visibility |
| Continuous testing | GitHub Actions        | Run the test suites automatically |

Each layer answers a different question.

### Unit layer

Does an isolated function produce the correct result for controlled input?

### API layer

Does an HTTP request receive the documented status code and response structure?

### Database layer

Can each database role access only the columns and rows it is authorised to read?

### Continuous-integration layer

Do all automated tests still pass after a branch is pushed or a Pull Request targets `main`?

## Sprint Scope

Sprint 2 includes:

- Jest configuration
- Supertest configuration
- Public property API tests
- Query-validation tests
- Slug-validation tests
- Error-response tests
- Service transformation tests
- Starting-price grouping tests
- Recursive privacy assertions
- pgTAP database-security tests
- Anonymous-role permission tests
- Authenticated-role permission tests
- Public RLS row-visibility tests
- Controlled database fixtures
- Transaction rollback
- GitHub Actions automation
- Automated-testing architecture documentation
- Pull Request review and merge

## Out of Scope

Sprint 2 does not include:

- Production-database testing
- Tests that depend on production credentials
- Browser end-to-end tests
- Frontend component tests
- Load and performance tests
- Accessibility tests
- Authentication-flow tests
- Provider-dashboard tests
- Administrator-dashboard tests
- Booking or payment tests
- Local Supabase container execution on the current workstation

## Sprint Backlog

| ID     | Task                                                    | Status |
| ------ | ------------------------------------------------------- | ------ |
| S2-001 | Create the automated-testing branch                     | Done |
| S2-002 | Install Jest                                            | Done |
| S2-003 | Install Supertest                                       | Done |
| S2-004 | Configure the backend test scripts                      | Done |
| S2-005 | Create the first public catalogue API test              | Done |
| S2-006 | Test invalid property-type validation                   | Done |
| S2-007 | Test pagination and query defaults                      | Done |
| S2-008 | Test property-slug validation                           | Done |
| S2-009 | Test controlled not-found responses                     | Done |
| S2-010 | Test sanitised internal-error responses                 | Done |
| S2-011 | Create recursive privacy assertions                     | Done |
| S2-012 | Test sensitive-field detection in nested objects        | Done |
| S2-013 | Test service-layer property transformations             | Done |
| S2-014 | Test grouped starting-price calculations                | Done |
| S2-015 | Create pgTAP database-security tests                    | Done |
| S2-016 | Test RLS activation on catalogue tables                 | Done |
| S2-017 | Test safe approximate-location permissions              | Done |
| S2-018 | Test restricted exact-location permissions              | Done |
| S2-019 | Test ownership and review-field restrictions            | Done |
| S2-020 | Create controlled RLS property fixtures                 | Done |
| S2-021 | Test anonymous property visibility                      | Done |
| S2-022 | Test authenticated property visibility                  | Done |
| S2-023 | Verify draft properties remain hidden                   | Done |
| S2-024 | Verify pending properties remain hidden                 | Done |
| S2-025 | Roll back database fixtures after testing               | Done |
| S2-026 | Create the GitHub Actions workflow                      | Done |
| S2-027 | Run application tests in GitHub Actions                 | Done |
| S2-028 | Run PostgreSQL and RLS tests in GitHub Actions          | Done |
| S2-029 | Document the automated-testing strategy in ADR-008      | Done |
| S2-030 | Review and correct failing test fixtures                | Done |
| S2-031 | Open Pull Request #3                                    | Done |
| S2-032 | Review and merge Pull Request #3 into `main`            | Done |

## Application Tests

Application tests run with:

```powershell
npm --prefix backend test
```

The backend test command executes:

```text
jest --runInBand
```

`--runInBand` runs the tests sequentially in one process. This keeps the initial test environment predictable and makes failures easier to diagnose.

The application suite contains eight tests across:

```text
backend/tests/api/publicProperties.test.js
backend/tests/helpers/privacyAssertions.test.js
backend/tests/services/propertyService.test.js
```

## API Testing with Supertest

Supertest sends requests directly to the Express application without requiring the backend to listen on a network port.

Example request flow:

```text
Supertest
→ Express application
→ Route
→ Controller
→ Mocked service
→ HTTP response assertion
```

The service layer is mocked in API tests so the tests can focus on:

- Routes
- Request validation
- Status codes
- Response structures
- Controller behaviour
- Error handling

This makes the API tests fast and independent of the network and remote database.

## Service Testing

Service tests verify data transformation separately from HTTP behaviour.

They confirm that the service:

- Converts database column names into the documented API format.
- Converts numeric database values into JavaScript numbers.
- Counts available units.
- Groups starting prices by currency and billing period.
- Selects the lowest available price within each compatible group.
- Excludes fields that are not part of the public response contract.

## Recursive Privacy Assertions

A reusable privacy helper recursively examines:

- Objects
- Nested objects
- Arrays
- Objects inside arrays

It fails when any forbidden public key is found at any depth.

Examples of forbidden fields include:

```text
streetAddress
street_address
exactLatitude
exact_latitude
exactLongitude
exact_longitude
createdBy
created_by
providerId
provider_id
verifiedBy
verified_by
uploadedBy
uploaded_by
storageProvider
storage_provider
storageKey
storage_key
administratorId
administrator_id
```

This protects the API against sensitive fields being accidentally introduced inside nested response data.

## Database Security Tests

Database tests use PostgreSQL and pgTAP.

They run against a temporary Supabase/PostgreSQL environment in GitHub Actions and do not connect to the production database.

The database-security suite verifies:

- RLS remains enabled on public catalogue tables.
- Anonymous visitors can read approximate coordinates.
- Anonymous visitors cannot read exact addresses.
- Anonymous visitors cannot read exact coordinates.
- Anonymous visitors cannot read property creators.
- Anonymous visitors cannot read media uploaders.
- Anonymous visitors cannot read media verifiers.
- Anonymous visitors cannot read rejection reasons.
- Approved public media identifiers have the intended database permissions.

The structural security file contains 19 pgTAP assertions.

## RLS Row-Visibility Tests

The RLS visibility tests create three controlled property fixtures:

1. A verified property that becomes published.
2. A verified property that remains a draft.
3. A pending property that remains a draft.

The tests switch to the `anon` and `authenticated` database roles and verify that:

- The published and verified property is visible.
- The verified draft property is hidden.
- The pending draft property is hidden.
- Only one eligible property is visible among all three fixtures.

The RLS visibility file contains eight pgTAP assertions.

## Controlled Fixtures

Test fixtures are temporary records created specifically to prove one expected behaviour.

The property fixtures use fixed UUIDs so the tests remain:

- Deterministic
- Easy to understand
- Easy to query
- Independent of existing development data

The eligible public property follows the real publication lifecycle:

```text
Draft property
→ Verified location
→ Rentable unit
→ Approved cover image
→ Published property
```

The test does not bypass database constraints merely to create convenient data.

## Transaction and Rollback

The database test begins with:

```sql
begin;
```

and ends with:

```sql
rollback;
```

The transaction allows the test to create realistic users, properties, locations, units and media.

`rollback` removes the temporary changes after the assertions finish. Test records therefore do not become persistent development or production data.

## Continuous Integration

The workflow is defined in:

```text
.github/workflows/automated-tests.yml
```

It contains two jobs:

### Jest and Supertest

This job:

1. Checks out the repository.
2. Configures Node.js.
3. Installs backend dependencies with `npm ci`.
4. Runs the application test suite.

### PostgreSQL and RLS

This job:

1. Checks out the repository.
2. Configures the Supabase CLI.
3. Disables the ordinary development seed.
4. Starts a temporary Supabase/PostgreSQL environment.
5. Runs the pgTAP database tests.

Both jobs passed before Pull Request #3 was merged.

## Production Safety Boundary

Automated tests must never connect to the production database.

Tests must not depend on:

- Production records
- Production Supabase URLs
- Production database connection strings
- Production API keys
- Ordinary development seed data
- Manually created remote records

Database tests use controlled fixtures in a disposable test environment.

## Engineering Decisions and Trade-offs

### 1. Layered automated testing

**Decision**

Use separate unit, API and database-security test layers.

**Reason**

Application behaviour and database security represent different responsibilities and failure modes.

**Alternative considered**

Use only API tests.

**Why the alternative was rejected**

API tests alone cannot prove that PostgreSQL column permissions and RLS policies are configured correctly.

**Trade-off**

Multiple test layers require additional files and maintenance, but failures are easier to locate and security is tested directly.

### 2. Mock the service during API tests

**Decision**

Mock the property service when testing Express routes and controllers.

**Reason**

API tests should remain fast and deterministic while focusing on HTTP behaviour.

**Alternative considered**

Connect every API test to a real database.

**Why the alternative was rejected**

That would make basic route and validation tests slower and more fragile.

**Trade-off**

Mocked API tests cannot prove database behaviour, so separate pgTAP tests are required.

### 3. Test database security with pgTAP

**Decision**

Use pgTAP to test PostgreSQL permissions and RLS directly.

**Reason**

Database security should be proven at the layer where it is enforced.

**Alternative considered**

Infer database security only from Express responses.

**Why the alternative was rejected**

A safe API response does not prove that the underlying database role cannot access a private column or row.

**Trade-off**

pgTAP requires a PostgreSQL testing environment, increasing CI setup time.

### 4. Use GitHub Actions for database tests

**Decision**

Use GitHub Actions as the primary database-test environment.

**Reason**

The current workstation does not have a compatible Docker/container environment for running the local Supabase stack.

**Alternative considered**

Skip database tests until the workstation supports Docker.

**Why the alternative was rejected**

Security testing should not be postponed because of a local infrastructure limitation.

**Trade-off**

Database-test feedback requires pushing the branch and waiting for CI, but tests still run in an isolated environment.

### 5. Use controlled fixtures instead of development seed data

**Decision**

Create exact records required by each database test.

**Reason**

Tests must be independent of demonstration content and ordinary development state.

**Alternative considered**

Run tests against `supabase/seed.sql`.

**Why the alternative was rejected**

Changing or removing demonstration data could cause unrelated test failures.

**Trade-off**

Fixture setup is longer, but each test’s assumptions are explicit.

### 6. Use transactions and rollback

**Decision**

Create database fixtures inside a transaction and roll them back after testing.

**Reason**

Temporary test data should not persist after the test run.

**Alternative considered**

Insert fixtures permanently and delete them individually.

**Why the alternative was rejected**

Manual cleanup is easier to omit and may leave partial records after a failure.

**Trade-off**

Transactional tests must account for triggers and role changes correctly.

### 7. Use recursive privacy checks

**Decision**

Inspect every nested API key instead of checking only the response’s top level.

**Reason**

Sensitive data could accidentally appear inside locations, units, amenities, fees or media arrays.

**Alternative considered**

Assert only a few known response paths.

**Why the alternative was rejected**

Path-specific checks may miss the same forbidden key at another nesting level.

**Trade-off**

The forbidden-key list must be maintained as the security contract evolves.

### 8. Follow real publication prerequisites in tests

**Decision**

Build the published-property fixture through its real lifecycle.

**Reason**

Test data should respect the same integrity rules as application data.

**Alternative considered**

Disable or bypass publication validation during tests.

**Why the alternative was rejected**

Bypassing constraints would create unrealistic fixtures and hide integration problems.

**Trade-off**

The fixture requires a location, unit and approved cover image, but it now validates the actual domain workflow.

## Problems Encountered and Resolutions

### Local container runtime unavailable

**Problem**

Docker was unavailable on the current workstation, preventing local execution of the Supabase database-test stack.

**Resolution**

GitHub Actions was configured to provide a temporary container-capable test environment.

**Lesson**

A development-machine limitation should not remove an important security check from the delivery process.

### Initial published fixture lacked a verified location

**Problem**

The test initially inserted a property directly with `publication_status = 'published'`.

The database rejected it with:

```text
Published property requires a verified location record
```

**Resolution**

The fixture was changed to begin as a draft. A verified location was inserted before publication.

**Lesson**

Tests must respect the system’s real state transitions and integrity constraints.

### Published fixture lacked a unit

**Problem**

After adding the location, publication was rejected again:

```text
Published property requires at least one unit
```

**Resolution**

A controlled rentable unit was added before publishing the property.

**Lesson**

Inspect the complete domain rule before constructing a complex fixture.

### Published fixture required an approved cover image

**Problem**

The publication-validation function also required an approved cover image.

**Resolution**

A controlled approved cover-image record was added before publication.

**Lesson**

Good fixtures represent a valid domain object, not merely the smallest convenient database row.

### Planned tests ran zero assertions

**Problem**

pgTAP reported that eight tests were planned but zero ran.

**Cause**

Fixture setup failed before execution reached the assertions.

**Resolution**

The fixture order was corrected to satisfy every publication prerequisite.

**Lesson**

A failed setup is different from a failed assertion. Test reports must be interpreted from the first error rather than only from the final summary.

## Test Results

### Application tests

```text
Test Suites: 3 passed, 3 total
Tests:       8 passed, 8 total
```

### Database structural-security tests

```text
19 pgTAP assertions passed
```

### Database RLS visibility tests

```text
8 pgTAP assertions passed
```

### Continuous integration

```text
Jest and Supertest:   Passed
PostgreSQL and RLS:   Passed
```

## Files Added or Modified

### Continuous integration

```text
.github/workflows/automated-tests.yml
```

### Backend

```text
backend/package.json
backend/package-lock.json
backend/src/services/propertyService.js
backend/tests/api/publicProperties.test.js
backend/tests/helpers/privacyAssertions.js
backend/tests/helpers/privacyAssertions.test.js
backend/tests/services/propertyService.test.js
```

### Database tests

```text
supabase/tests/database/public_catalogue_security.test.sql
supabase/tests/database/public_catalogue_rls.test.sql
```

### Architecture documentation

```text
docs/architecture/decisions/ADR-008-automated-testing-strategy.md
```

## Sprint Review

Sprint 2 achieved its core goal.

The public catalogue now has automated coverage across:

- Application logic
- HTTP behaviour
- Input validation
- Response contracts
- Privacy rules
- PostgreSQL permissions
- Row Level Security
- Continuous integration

The tests found invalid fixture assumptions before the work was merged. PostgreSQL correctly enforced the publication rules, and GitHub Actions prevented the incomplete fixture from passing unnoticed.

After the fixtures were corrected, both workflow jobs passed.

The work was reviewed through Pull Request #3 and merged successfully into `main`.

## Sprint Retrospective

### What went well

- The first automated backend test foundation was created.
- API tests run quickly without starting a network server.
- Service logic is tested independently.
- Nested private fields are checked recursively.
- PostgreSQL security is tested directly.
- GitHub Actions provides the missing container environment.
- Test records do not depend on production data.
- Database fixtures are rolled back.
- Failed CI output was investigated from the first error.
- Pull Request #3 passed both automated jobs before merging.

### What could be improved

- The complete publication-validation function should have been inspected before creating the first fixture.
- Database fixtures should be designed from domain rules, not individual table requirements.
- A Docker-compatible local environment would provide faster database-test feedback.
- Test cases should be mapped to requirements before implementation begins.
- Automated coverage should be added alongside each future feature.

### Actions for the next sprint

- Create tests alongside new implementation work.
- Expand application coverage as catalogue features grow.
- Add frontend tests when the catalogue interface is implemented.
- Add end-to-end tests after frontend and backend integration.
- Keep privacy assertions synchronized with the API contract.
- Preserve the production-environment testing boundary.
- Document test results during each sprint rather than only at closeout.

## Lessons Learned

- A passing API test does not prove that database permissions are correct.
- Database security should be tested directly.
- Automated tests can find incorrect development assumptions before users encounter them.
- A red CI result is useful when it prevents unsafe or incomplete work from being merged.
- Failed fixture setup and failed assertions are different problems.
- Controlled fixtures make tests deterministic.
- Transactions and rollback keep database tests isolated.
- Tests should follow real application state transitions.
- Database constraints are executable business rules.
- CI provides a consistent environment when local infrastructure is limited.
- A feature is safer when its application behaviour, database rules and public contract are tested independently.

## Definition of Done

Sprint 2 is complete because:

- [x] Jest is configured.
- [x] Supertest is configured.
- [x] Unit tests are implemented.
- [x] Public API tests are implemented.
- [x] Validation behaviour is tested.
- [x] Error responses are tested.
- [x] Service transformations are tested.
- [x] Nested privacy assertions are implemented.
- [x] PostgreSQL permissions are tested.
- [x] RLS activation is tested.
- [x] Anonymous row visibility is tested.
- [x] Authenticated row visibility is tested.
- [x] Draft properties remain hidden.
- [x] Pending properties remain hidden.
- [x] Fixtures are controlled and deterministic.
- [x] Temporary fixture data is rolled back.
- [x] GitHub Actions runs application tests.
- [x] GitHub Actions runs database-security tests.
- [x] ADR-008 documents the testing strategy.
- [x] Both continuous-integration jobs pass.
- [x] Pull Request #3 was reviewed.
- [x] Pull Request #3 was merged into `main`.
- [x] Sprint status is marked Completed.

## Next Steps

The next development sprint should build on this automated-testing foundation.

Potential priorities include:

- Public catalogue frontend
- Frontend-to-backend integration
- Property cards and detail pages
- Search and filter interface
- Loading, empty and error states
- Responsive design
- Frontend component tests
- End-to-end catalogue tests