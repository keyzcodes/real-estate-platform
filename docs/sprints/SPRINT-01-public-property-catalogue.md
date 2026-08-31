# Sprint 1 — Public Property Catalogue

## Sprint Information

| Item                | Value                               |
| ------------------- | ----------------------------------- |
| Sprint              | Sprint 1                            |
| Status              | Completed                           |
| Start date          | 25 August 2026                      |
| Completion date     | 31 August 2026                      |
| Developer           | Sunday Jime                         |
| Development process | Agile, iterative development        |
| Feature branch      | `feature/public-property-catalogue` |
| Target branch       | `main`                              |
| Pull Request        | PR #1                               |

## Sprint Goal

Build a secure public property catalogue that allows unauthenticated visitors to browse published and verified rental properties without exposing private provider information or exact property locations.

The catalogue must communicate rental prices and additional fees transparently while enforcing database security and privacy rules.

## Problem Being Solved

Rental customers may encounter:

- Hidden additional charges
- Inflated agent fees
- Misleading rental-price comparisons
- Unverified property listings
- Insufficient information before inspection
- Exposure of sensitive property or provider information

This sprint established the first public-facing backend capability for addressing these problems.

## User Stories

### Browse properties

As a visitor, I want to browse published and verified properties so that I can identify suitable rental options.

### Filter properties

As a visitor, I want to filter properties by location and property type so that I can narrow the catalogue to relevant results.

### Understand pricing

As a visitor, I want rent and additional fees disclosed separately so that I can understand the real cost of a property.

### View property details

As a visitor, I want to view units, amenities, fees and approved media so that I can evaluate a property before contacting its provider.

### Maintain location privacy

As a property provider, I want the public to receive a useful approximate location without exposing the exact property address.

## Sprint Scope

Sprint 1 included:

- Supabase backend connection
- Public catalogue database permissions
- Public catalogue Row Level Security policies
- Public unit-fee read policy
- Demonstration property seed data
- Public property-list endpoint
- Public property-detail endpoint
- Pagination
- Location and property-type filters
- Newest and oldest sorting
- Query validation
- Property-slug validation
- Safe API data projection
- Approximate public locations
- Transparent base rent and additional fees
- Property and unit amenities
- Approved media metadata
- Documentation and Architecture Decision Records
- Feature-branch and Pull Request workflow

## Out of Scope

Sprint 1 did not include:

- Public catalogue frontend
- User registration and login interface
- Administrator dashboard
- Provider onboarding
- Property creation or editing through the API
- Booking
- Payments
- Exact public locations
- Cloudinary media delivery
- Google Maps integration
- Automated API test suite

## Sprint Backlog

| ID     | Task                                             | Status |
| ------ | ------------------------------------------------ | ------ |
| S1-001 | Create the feature branch                        | Done   |
| S1-002 | Connect Express to Supabase                      | Done   |
| S1-003 | Configure API versioning                         | Done   |
| S1-004 | Add security headers                             | Done   |
| S1-005 | Configure CORS                                   | Done   |
| S1-006 | Add request rate limiting                        | Done   |
| S1-007 | Add controlled error responses                   | Done   |
| S1-008 | Create public catalogue database permissions     | Done   |
| S1-009 | Create public catalogue RLS policies             | Done   |
| S1-010 | Add the public `unit_fees` read policy           | Done   |
| S1-011 | Create reusable demonstration seed data          | Done   |
| S1-012 | Build the public property-list endpoint          | Done   |
| S1-013 | Add pagination                                   | Done   |
| S1-014 | Add location filters                             | Done   |
| S1-015 | Add property-type filtering                      | Done   |
| S1-016 | Add newest and oldest sorting                    | Done   |
| S1-017 | Add Zod query validation                         | Done   |
| S1-018 | Add property-slug validation                     | Done   |
| S1-019 | Build the public property-detail endpoint        | Done   |
| S1-020 | Return property and unit amenities               | Done   |
| S1-021 | Return transparent unit fees                     | Done   |
| S1-022 | Return approved media metadata                   | Done   |
| S1-023 | Protect exact locations and private fields       | Done   |
| S1-024 | Test the property-list endpoint                  | Done   |
| S1-025 | Test the property-detail endpoint                | Done   |
| S1-026 | Commit and push the feature implementation       | Done   |
| S1-027 | Update the public catalogue API documentation    | Done   |
| S1-028 | Create Architecture Decision Records             | Done   |
| S1-029 | Run the regression and privacy test matrix       | Done   |
| S1-030 | Review the complete branch diff                  | Done   |
| S1-031 | Open Pull Request #1                             | Done   |
| S1-032 | Review and merge Pull Request #1 into `main`     | Done   |

## API Endpoints

### List Public Properties

```http
GET /api/v1/properties
```

Supported query parameters:

| Parameter      | Purpose                                      |
| -------------- | -------------------------------------------- |
| `page`         | Select the results page                      |
| `limit`        | Control the number of results per page       |
| `country`      | Filter using a two-letter country code       |
| `state`        | Filter by state or region                    |
| `city`         | Filter by city                               |
| `area`         | Filter by local area                         |
| `propertyType` | Filter by an allowed property type           |
| `sort`         | Sort using `newest` or `oldest`              |

Example:

```http
GET /api/v1/properties?city=maiduguri&propertyType=apartment_building&page=1&limit=12
```

### Get One Public Property

```http
GET /api/v1/properties/:slug
```

Example:

```http
GET /api/v1/properties/demo-green-view-residence-10000000-000
```

The detail endpoint returns:

- Safe property information
- Approximate location
- Property amenities
- Unit information
- Base rent
- Transparent additional fees
- Unit amenities
- Approved media metadata
- Creation and update timestamps

## Files Added or Modified

### Backend

```text
backend/src/app.js
backend/src/controllers/propertyController.js
backend/src/routes/propertyRoutes.js
backend/src/services/propertyService.js
backend/src/validators/propertyQueryValidator.js
```

### Database

```text
supabase/migrations/20260825182354_add_public_catalogue_read_policies.sql
supabase/migrations/20260825231400_allow_public_read_unit_fees.sql
supabase/seed.sql
```

### Documentation

```text
README.md
CHANGELOG.md
docs/api/public-catalog-api.md
docs/architecture/decisions/ADR-005-public-location-privacy.md
docs/architecture/decisions/ADR-006-transparent-rental-pricing.md
docs/architecture/decisions/ADR-007-public-api-security-and-migrations.md
docs/sprints/SPRINT-00.md
docs/sprints/SPRINT-01-public-property-catalogue.md
```

## Database and Security Implementation

The public catalogue uses several security layers:

1. PostgreSQL column permissions determine which fields public roles may read.
2. Row Level Security determines which records public roles may access.
3. The API explicitly selects safe fields.
4. Zod validates query parameters and property slugs.
5. Controllers return controlled error responses.
6. The service transforms database records into the documented public contract.
7. Exact addresses, exact coordinates and provider identifiers are excluded.

The public request flow is:

```text
Visitor
  → Express route
  → Controller
  → Zod validation
  → Service
  → Supabase publishable key
  → PostgreSQL permissions and RLS
  → Controlled public response
```

## Engineering Decisions and Trade-offs

### 1. Publishable key instead of a service-role key

**Decision:** Use the Supabase publishable key for anonymous catalogue requests.

**Reason:** It operates under the `anon` role, allowing database permissions and RLS to remain active.

**Alternative:** Use a service-role or secret key.

**Why rejected:** A privileged key could bypass RLS and increase the impact of an application mistake.

**Trade-off:** Security is stronger, but grants and RLS policies require more careful design.

### 2. Explicit field selection instead of `SELECT *`

**Decision:** Select only the fields required by each public endpoint.

**Reason:** Private fields added later should not become public automatically.

**Alternative:** Retrieve every field and remove private data in JavaScript.

**Why rejected:** This transfers unnecessary data and creates a greater disclosure risk.

**Trade-off:** Queries are longer and must be updated deliberately.

### 3. Approximate location instead of exact location

**Decision:** Return general location fields and approximate coordinates.

**Reason:** Visitors need geographic context without gaining immediate access to a private or occupied property.

**Alternative:** Publish the exact address and coordinates.

**Why rejected:** Exact locations create privacy, security, trespassing and listing-circumvention risks.

**Trade-off:** Public maps are less precise, but property and occupant privacy is stronger.

### 4. Separate base rent from additional fees

**Decision:** Store and return fees separately from base rent.

**Reason:** Customers should understand how the complete rental obligation is composed.

**Alternative:** Store one combined amount.

**Why rejected:** A combined amount hides refundable, non-refundable, optional and recurring charges.

**Trade-off:** The database and API are more complex, but pricing is more transparent.

### 5. Group prices by currency and billing period

**Decision:** Return `startingPrices` grouped by currency and billing period.

**Reason:** Monthly, yearly and differently denominated prices cannot be compared as ordinary numbers.

**Alternative:** Return one lowest numeric value as `startingPrice`.

**Why rejected:** The smallest number may not represent the lowest real cost.

**Trade-off:** The frontend must display multiple price groups, but customers receive accurate information.

### 6. Forward-only corrective migrations

**Decision:** Add a new migration when the public `unit_fees` permission was found to be missing.

**Reason:** The previous migration had already been deployed.

**Alternative:** Edit the deployed migration.

**Why rejected:** This would make local migration history disagree with the remote database.

**Trade-off:** More migration files are created, but history remains truthful and reproducible.

### 7. Seed data instead of demonstration data in migrations

**Decision:** Store the demonstration property in `supabase/seed.sql`.

**Reason:** Migrations should define permanent structural changes, while sample content should remain replaceable.

**Alternative:** Insert demonstration data through a migration.

**Why rejected:** Temporary test content would become part of permanent database history.

**Trade-off:** Seed data runs separately, but test content and database structure remain distinct.

### 8. Transactional and idempotent seed data

**Decision:** Create the demonstration property inside a transaction and prevent duplicate insertion.

**Reason:** All related records should be created together, and repeated execution should not duplicate them.

**Alternative:** Run independent inserts without checking existing records.

**Why rejected:** Failures could leave incomplete properties or duplicate data.

**Trade-off:** The seed script is longer, but it is safer and repeatable.

### 9. Route, controller and service separation

**Decision:** Separate HTTP routing, request handling and database access.

**Reason:** Each module should have a clear responsibility.

**Alternative:** Put validation, queries and responses inside one route handler.

**Why rejected:** A large handler would be harder to understand, reuse and test.

**Trade-off:** More files are required, but each module remains focused.

### 10. Allowlist validation

**Decision:** Accept only documented pagination values, filters, property types, sorting values and slug formats.

**Reason:** Public input must not be trusted automatically.

**Alternative:** Pass raw request values to the query builder.

**Why rejected:** Unrestricted values could produce unpredictable behaviour and inconsistent contracts.

**Trade-off:** New options must be added to the validator deliberately.

### 11. Consistent `404` responses

**Decision:** Return the same not-found response for nonexistent and inaccessible properties.

**Reason:** Visitors should not be able to determine whether a private draft exists.

**Alternative:** Return separate responses for drafts, rejected records and missing properties.

**Why rejected:** Different responses could expose private resource states.

**Trade-off:** Public clients receive less diagnostic detail, but private information remains protected.

### 12. Keep media URLs explicitly `null`

**Decision:** Return `url: null` until Cloudinary delivery is implemented.

**Reason:** The API should represent its real capabilities honestly.

**Alternative:** Return a placeholder or fabricated URL.

**Why rejected:** A fake URL would create an unreliable API contract.

**Trade-off:** Images cannot yet be displayed, but the integration boundary remains explicit.

## Problems Encountered and Resolutions

### Incorrect Supabase environment variables

**Problem:** The Supabase URL and publishable key were initially assigned incorrectly.

**Resolution:** The values were corrected and the backend connection was retested.

**Lesson:** Environment-variable names and values must be verified independently.

### Unsaved files caused module errors

**Problem:** Node.js could not find newly created modules that had not been saved.

**Resolution:** The files were saved and Nodemon restarted the backend.

**Lesson:** Confirm the editor’s saved state before diagnosing module-resolution failures.

### Public queries were blocked by security policies

**Problem:** RLS and column permissions initially prevented legitimate catalogue reads.

**Resolution:** Narrow public grants and RLS policies were added for published and verified properties.

**Lesson:** Secure default denial is preferable; legitimate access should be granted deliberately.

### Public unit fees were missing

**Problem:** `unit_fees` did not have the public permission required by the detail endpoint.

**Resolution:** A forward-only migration added restricted column access and an RLS policy.

**Lesson:** Permissions for every related table must be tested as part of the complete resource.

### PowerShell working-directory error

**Problem:** Project-root paths were used while the terminal was inside `backend`.

**Resolution:** The terminal returned to the repository root before staging files.

**Lesson:** Relative paths are resolved from the current working directory.

### PowerShell continuation-character error

**Problem:** A backtick was placed before `git` rather than at the end of a continued line.

**Resolution:** The staging command was simplified to one line.

**Lesson:** Simple commands reduce shell-specific syntax errors.

### Risk of misleading price calculations

**Problem:** One minimum numeric rent could incorrectly compare monthly and yearly values.

**Resolution:** Prices were grouped by currency and billing period.

**Lesson:** Correct calculations must consider the meaning and units of data.

### Risk of exposing sensitive fields

**Problem:** Relational queries could accidentally expose exact locations, provider data or storage details.

**Resolution:** Explicit field selection and controlled response transformation were used.

**Lesson:** Database permissions and API projection should reinforce one another.

### Demonstration-data text errors

**Problem:** Two demonstration descriptions contained missing spaces in the remote database.

**Resolution:** The local seed file was verified and the remote demonstration records were corrected safely.

**Lesson:** Test data should be reviewed because visible sample content is part of API quality.

## Testing Performed

### Property-list request

```http
GET /api/v1/properties?page=1&limit=12
```

Confirmed:

- Published and verified property returned
- Pagination metadata correct
- Exact address absent
- Exact coordinates absent
- Provider and administrator identifiers absent
- Approximate coordinates returned
- Available units counted
- Starting prices grouped correctly

### Filtered request

```http
GET /api/v1/properties?city=maiduguri&propertyType=apartment_building&page=1&limit=12
```

Confirmed:

- Matching property returned
- Location matching was case-insensitive

### Empty result

```http
GET /api/v1/properties?city=Abuja&page=1&limit=12
```

Confirmed:

- Request returned `200`
- `properties` was empty
- Pagination totals were zero

### Invalid property type

```http
GET /api/v1/properties?propertyType=hotel
```

Confirmed:

```text
400 INVALID_QUERY_PARAMETERS
```

### Limit above maximum

```http
GET /api/v1/properties?limit=51
```

Confirmed:

```text
400 INVALID_QUERY_PARAMETERS
```

### Page below minimum

```http
GET /api/v1/properties?page=0
```

Confirmed:

```text
400 INVALID_QUERY_PARAMETERS
```

### Invalid country code

```http
GET /api/v1/properties?country=NGA
```

Confirmed:

```text
400 INVALID_QUERY_PARAMETERS
```

### Invalid slug

```http
GET /api/v1/properties/Demo-Property
```

Confirmed:

```text
400 INVALID_PROPERTY_SLUG
```

### Nonexistent property

```http
GET /api/v1/properties/property-that-does-not-exist
```

Confirmed:

```text
404 PROPERTY_NOT_FOUND
```

### Property-detail request

```http
GET /api/v1/properties/demo-green-view-residence-10000000-000
```

Confirmed:

- Property information returned
- Approximate location returned
- Exact location absent
- Property amenities returned
- Unit information returned
- Base rent returned
- Refundable caution fee returned
- Unit amenities returned
- Approved media metadata returned
- Media URL remained `null`
- Provider, administrator, uploader and storage-key fields were absent

### Git review

Confirmed:

- `git diff --check` passed
- Working tree was clean
- Feature branch matched its GitHub remote
- Two feature commits were included
- Sixteen files differed from `main`
- Pull Request #1 was mergeable
- Pull Request #1 was merged successfully

## Current Result

The backend can return a verified property with:

- General and approximate location
- Available units
- Property amenities
- Unit amenities
- Base rent
- Transparent fees
- Approved media metadata

It does this without exposing:

- Exact address
- Exact coordinates
- Provider identity
- Administrator identity
- Uploader identity
- Storage keys
- Private property states
- Secret credentials

## Lessons Learned

- Database security and API projection should reinforce each other.
- Public APIs should explicitly define every exposed field.
- Secure systems require deliberate permission design and testing.
- Price calculations must respect currencies and billing periods.
- Applied database migrations should remain immutable.
- Demonstration data and database structure have different lifecycles.
- Validation should happen before database operations.
- Consistent errors improve security and client integration.
- File paths depend on the terminal’s current working directory.
- Documentation must evolve with implementation.
- A feature is complete only when code, tests, documentation and review agree.

## Sprint Review

Sprint 1 achieved its core goal.

The property-list and property-detail endpoints work successfully. The API supports pagination, validated filters, approximate locations, amenities, transparent fees and controlled error responses while protecting sensitive information.

The implementation and documentation were committed to:

```text
feature/public-property-catalogue
```

The feature was reviewed through Pull Request #1 and merged successfully into `main` on 31 August 2026.

## Sprint Retrospective

### What Went Well

- The first public product feature works end to end.
- Database security remained active throughout the public request flow.
- Exact property locations and provider information remained protected.
- Transparent fee disclosure was incorporated into the model and API.
- Positive, empty-state and negative behaviours were tested.
- The feature was developed on an isolated branch.
- Engineering decisions and trade-offs were documented.
- The first Pull Request was reviewed and merged successfully.

### What Could Be Improved

- Documentation should be updated during implementation.
- A formal test checklist should be created before development begins.
- Automated tests should replace repeated manual requests.
- Shell instructions should state the required working directory.
- API documentation should change whenever the API contract changes.
- Sprint status should be updated after every session.

### Actions for the Next Sprint

- Define documentation and testing tasks at the beginning.
- Add automated service and controller tests.
- Add API integration tests.
- Maintain ADRs alongside implementation decisions.
- Include privacy tests in every public endpoint review.
- Keep the README and changelog synchronized with merged features.

## Definition of Done

- [x] Public property-list endpoint works.
- [x] Public property-detail endpoint works.
- [x] Pagination works.
- [x] Filters and sorting work.
- [x] Public input is validated.
- [x] Published and verified records are protected by RLS.
- [x] Exact locations and private fields are excluded.
- [x] Transparent fees are returned.
- [x] Demonstration seed data is available.
- [x] Implementation is committed and pushed.
- [x] API documentation is updated.
- [x] Architecture Decision Records are added.
- [x] Regression and privacy checks pass.
- [x] Pull Request #1 was opened and reviewed.
- [x] Feature was merged into `main`.
- [x] Sprint status is `Completed`.

## Next Steps

1. Build the public property catalogue frontend.
2. Add automated API integration and privacy tests.
3. Integrate Cloudinary media delivery.
4. Add map-based property discovery.
5. Begin the next sprint on a dedicated feature branch.