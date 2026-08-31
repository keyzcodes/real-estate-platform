# Sprint 1 — Public Property Catalogue

## Sprint Information

| Item                | Value                                        |
| ------------------- | -------------------------------------------- |
| Sprint              | Sprint 1                                     |
| Status              | Implementation complete — review in progress |
| Start date          | 25 August 2026                               |
| Developer           | Sunday Jime                                  |
| Development process | Agile, iterative development                 |
| Feature branch      | `feature/public-property-catalogue`          |
| Target branch       | `main`                                       |

## Sprint Goal

Build a secure public property catalogue that allows visitors to browse verified rental properties and view their details without exposing private provider information or exact property locations.

The catalogue must communicate rental prices and additional fees transparently while enforcing privacy and database security rules.

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

As a visitor, I want to browse verified and published properties so that I can identify suitable rental options.

### Filter properties

As a visitor, I want to filter properties by location and property type so that I can narrow the catalogue to relevant results.

### Understand pricing

As a visitor, I want rent and additional fees to be disclosed separately so that I can understand the real cost of a property.

### View property details

As a visitor, I want to view units, amenities, fees and approved media so that I can evaluate a property before contacting its provider.

### Maintain location privacy

As a property provider, I want the public to receive a useful approximate location without exposing the exact property address.

## Sprint Scope

Sprint 1 includes:

- Supabase backend connection
- Public catalogue database permissions
- Public catalogue Row Level Security policies
- Public unit-fee read policy
- Demonstration property seed data
- Public property-list endpoint
- Public property-detail endpoint
- Pagination
- Catalogue filters
- Sorting
- Query validation
- Property-slug validation
- Safe API data projection
- Approximate public locations
- Transparent base rent and additional fees
- Property and unit amenities
- Approved media metadata
- Feature-branch workflow

## Out of Scope

Sprint 1 does not include:

- Frontend catalogue interface
- User registration and login interface
- Administrator dashboard
- Provider onboarding
- Property creation through the API
- Property editing through the API
- Booking
- Payment processing
- Exact public locations
- Cloudinary media delivery URLs
- Google Maps integration
- Automated test suite

## Sprint Backlog

| ID     | Task                                              | Status      |
| ------ | ------------------------------------------------- | ----------- |
| S1-001 | Create the feature branch                         | Done        |
| S1-002 | Connect Express to Supabase                       | Done        |
| S1-003 | Configure API versioning                          | Done        |
| S1-004 | Add security headers                              | Done        |
| S1-005 | Configure CORS                                    | Done        |
| S1-006 | Add request rate limiting                         | Done        |
| S1-007 | Add controlled error responses                    | Done        |
| S1-008 | Create public catalogue database permissions      | Done        |
| S1-009 | Create public catalogue RLS policies              | Done        |
| S1-010 | Add the public `unit_fees` read policy            | Done        |
| S1-011 | Create reusable demonstration seed data           | Done        |
| S1-012 | Build the public property-list endpoint           | Done        |
| S1-013 | Add pagination                                    | Done        |
| S1-014 | Add location filters                              | Done        |
| S1-015 | Add property-type filtering                       | Done        |
| S1-016 | Add newest and oldest sorting                     | Done        |
| S1-017 | Add Zod query validation                          | Done        |
| S1-018 | Add property-slug validation                      | Done        |
| S1-019 | Build the public property-detail endpoint         | Done        |
| S1-020 | Return property and unit amenities                | Done        |
| S1-021 | Return transparent unit fees                      | Done        |
| S1-022 | Return approved media metadata                    | Done        |
| S1-023 | Protect exact locations and private fields        | Done        |
| S1-024 | Test the property-list endpoint                   | Done        |
| S1-025 | Test the property-detail endpoint                 | Done        |
| S1-026 | Commit and push the feature implementation        | Done        |
| S1-027 | Update the public catalogue API documentation     | In Progress |
| S1-028 | Create architecture decision records              | To Do       |
| S1-029 | Run the final regression and privacy test matrix  | To Do       |
| S1-030 | Review the complete branch diff                   | To Do       |
| S1-031 | Open the Pull Request                             | To Do       |
| S1-032 | Review and merge the Pull Request into `main`     | To Do       |

## API Endpoints

### List public properties

```http
GET /api/v1/properties

Supported query parameters:

Parameter	Purpose
page	Select the results page
limit	Control the number of results per page
country	Filter using a two-letter country code
state	Filter by state or region
city	Filter by city
area	Filter by local area
propertyType	Filter by an allowed property type
sort	Sort results using newest or oldest

Example:

GET /api/v1/properties?city=maiduguri&propertyType=apartment_building&page=1&limit=12
Get one public property
GET /api/v1/properties/:slug

Example:

GET /api/v1/properties/demo-green-view-residence-10000000-000

The detail endpoint returns:

Safe property information
Approximate location
Property amenities
Available units
Base rent
Transparent additional fees
Unit amenities
Approved media metadata
Creation and update timestamps
Files Added or Modified
Backend
backend/src/app.js
backend/src/config/supabase.js
backend/src/controllers/propertyController.js
backend/src/routes/propertyRoutes.js
backend/src/services/propertyService.js
backend/src/validators/propertyQueryValidator.js
Database
supabase/migrations/20260825182354_add_public_catalogue_read_policies.sql
supabase/migrations/20260825231400_allow_public_read_unit_fees.sql
supabase/seed.sql
Documentation
docs/api/public-catalog-api.md
docs/sprints/SPRINT-00.md
docs/sprints/SPRINT-01-public-property-catalogue.md

Additional documentation and ADR updates remain part of the pre-merge review.

Database and Security Implementation

The public catalogue relies on several security layers:

PostgreSQL column permissions determine which columns public roles may read.
Row Level Security determines which records public roles may access.
The API explicitly selects safe fields.
Zod validates public query parameters and route parameters.
Controllers return controlled error responses.
The service transforms database fields into the documented public response.
Exact addresses, exact coordinates and provider identifiers are excluded.
Engineering Decisions and Trade-offs
1. Publishable key instead of a secret backend key
Decision

Use the Supabase publishable key for the public catalogue connection.

Reason

The publishable key operates under the anon database role, allowing PostgreSQL permissions and Row Level Security to remain active.

Alternative considered

Use a Supabase secret or service-role key.

Why the alternative was rejected

A privileged key could bypass Row Level Security. That would make the backend solely responsible for preventing private-data exposure and increase the impact of programming mistakes.

Trade-off

The publishable key provides stronger defence in depth but requires carefully designed grants and RLS policies.

2. Explicit field selection instead of SELECT *
Decision

Select only the database fields required by each public endpoint.

Reason

Public responses should not automatically expand when private columns are later added to a table.

Alternative considered

Retrieve all columns and remove private fields in JavaScript.

Why the alternative was rejected

Removing fields after retrieval creates a greater risk of accidental disclosure and transfers unnecessary data from the database.

Trade-off

Explicit queries are longer and must be updated deliberately when the API contract changes.

3. Approximate location instead of exact public location
Decision

Expose approximate coordinates and general location fields while protecting exact addresses and coordinates.

Reason

Visitors need enough information to evaluate the area without gaining immediate access to a private residence or protected listing location.

Alternative considered

Expose the exact location for maximum search convenience.

Why the alternative was rejected

Exact public locations could create privacy, security, trespassing and listing-circumvention risks.

Trade-off

Approximate locations provide less navigation precision but offer a safer balance between discovery and privacy.

4. Separate base rent from additional fees
Decision

Store and return base rent separately from caution, service, maintenance, legal and other fees.

Reason

Customers should see how the total rental obligation is composed.

Alternative considered

Store one combined rental amount.

Why the alternative was rejected

A combined amount hides the nature of additional charges and makes refundable and non-refundable fees difficult to distinguish.

Trade-off

Separate fee records make the model and API more complex, but they improve transparency and extensibility.

5. Group starting prices by currency and billing period
Decision

Return startingPrices as a collection grouped by currency and billing period.

Reason

A monthly price cannot be compared directly with a yearly price, and amounts in different currencies cannot be treated as one price scale.

Alternative considered

Return one lowest numeric amount as startingPrice.

Why the alternative was rejected

The smallest number may not represent the lowest actual cost. For example, a monthly rent could appear cheaper than a yearly rent solely because their billing periods differ.

Trade-off

The frontend must display multiple starting-price groups, but the response avoids misleading users.

6. Forward-only corrective migrations
Decision

Create a new migration when the public unit_fees permission was found to be missing.

Reason

The earlier public-catalogue migration had already been deployed.

Alternative considered

Edit the previously deployed migration.

Why the alternative was rejected

Changing an applied migration would make local migration history disagree with the remote database and could produce inconsistent environments.

Trade-off

The migration directory contains an additional corrective file, but the database history remains truthful and reproducible.

7. Seed data instead of demonstration data in migrations
Decision

Place the demonstration property in supabase/seed.sql.

Reason

Migrations should define permanent structural changes. Demonstration content should remain replaceable and reusable.

Alternative considered

Insert the demonstration listing through a schema migration.

Why the alternative was rejected

Test content would become part of the permanent database-change history and would be harder to replace or omit in another environment.

Trade-off

Seed data must be executed separately, but database structure and test content remain clearly separated.

8. Transactional and idempotent seed data
Decision

Create the demonstration property inside a transaction and prevent duplicate insertion.

Reason

All related records should be created together, and repeatedly running the seed should not create duplicate listings.

Alternative considered

Run independent insert statements without checking existing records.

Why the alternative was rejected

A failure could leave an incomplete property, while repeated execution could create duplicate data.

Trade-off

The seed script is longer, but it is safer and repeatable.

9. Route, controller and service separation
Decision

Separate HTTP routing, request handling and database operations.

Reason

Each module should have one clear responsibility.

Alternative considered

Place validation, database queries and response construction inside a single Express route.

Why the alternative was rejected

A large route handler would be harder to test, reuse, understand and maintain.

Trade-off

The feature uses more files, but each file is smaller and more focused.

10. Allowlist validation for public input
Decision

Accept only known pagination values, filters, property types, sorting options and slug formats.

Reason

Public input must not be trusted automatically.

Alternative considered

Pass raw request values directly to the database query builder.

Why the alternative was rejected

Unrestricted values can cause unpredictable behaviour, excessive resource use and an inconsistent API contract.

Trade-off

New property types and query options must be added to the validator deliberately.

11. Consistent 404 for inaccessible properties
Decision

Return the same not-found response for nonexistent, unpublished and otherwise inaccessible properties.

Reason

Visitors should not be able to determine whether a private draft exists.

Alternative considered

Return separate responses for draft, rejected, private and nonexistent properties.

Why the alternative was rejected

Different responses could disclose private resource states through enumeration.

Trade-off

Public clients receive less diagnostic detail, but private listing information remains protected.

12. Keep media URLs explicitly null
Decision

Return url: null until Cloudinary delivery is implemented.

Reason

The API should describe its actual capability honestly.

Alternative considered

Construct or return a placeholder media URL.

Why the alternative was rejected

A fake URL would give clients an unreliable contract and could be mistaken for a working delivery feature.

Trade-off

The current API cannot display property images, but it avoids false functionality and preserves a clear integration point.

Problems Encountered and Resolutions
Incorrect Supabase environment-variable values
Problem

The Supabase URL and publishable key were initially assigned incorrectly.

Resolution

The environment-variable values were corrected and the backend connection was retested.

Lesson

Environment-variable names and values must be verified independently, even when the application starts.

Unsaved files caused module-loading errors
Problem

Node.js could not find expected modules because some newly created files had not been saved.

Resolution

The relevant files were saved and Nodemon restarted the backend.

Lesson

Confirm the editor’s saved state before diagnosing an import or module-resolution failure.

Public queries were blocked by database security
Problem

Row Level Security and column permissions initially prevented legitimate catalogue data from being returned.

Resolution

Public read grants and narrowly scoped RLS policies were added for verified and published properties.

Lesson

A secure default denial is preferable. Legitimate access should be granted deliberately and tested.

Public unit fees were missing
Problem

The property-detail endpoint needed transparent fees, but unit_fees lacked the required public read policy.

Resolution

A new forward-only migration granted safe column access and added an RLS policy tied to published and verified properties.

Lesson

Related-table permissions must be tested as part of the complete resource response.

PowerShell working-directory error
Problem

A git add command used project-root paths while the terminal was inside the backend directory.

Git therefore searched for paths such as:

backend/backend/src/...
Resolution

The terminal returned to the project root before staging the files.

Lesson

Relative paths are interpreted from the current working directory, not automatically from the Git repository root.

PowerShell continuation-character error
Problem

A backtick was placed before git instead of at the end of a continued PowerShell line.

Resolution

The staging command was simplified to a single line.

Lesson

For short Git commands, one-line commands reduce shell-specific syntax mistakes.

Risk of misleading price calculation
Problem

Selecting one minimum numeric rent could incorrectly compare monthly and yearly prices.

Resolution

Starting prices were grouped by currency and billing period.

Lesson

Correct calculations require understanding the meaning and units of the data, not only comparing numeric values.

Risk of exposing sensitive fields
Problem

Nested relational queries could accidentally expose exact locations, provider information or storage details.

Resolution

The service used explicit field selection and transformed the result into a controlled public response.

Lesson

Database access permission and API response projection should both protect sensitive data.

Testing Performed
Successful property-list request
GET /api/v1/properties?page=1&limit=12

Confirmed:

A verified and published demonstration property was returned.
Pagination metadata was correct.
Exact addresses were absent.
Exact coordinates were absent.
Provider and administrator identifiers were absent.
Approximate coordinates were returned.
Available units were counted.
Starting prices were grouped correctly.
Successful filtered request
GET /api/v1/properties?city=maiduguri&propertyType=apartment_building&page=1&limit=12

Expected and confirmed behaviour:

A matching verified property is returned.
Location matching is case-insensitive.
Valid request with no match
GET /api/v1/properties?city=Abuja&page=1&limit=12

Expected behaviour:

{
  "properties": []
}

An empty result is treated as a successful request, not a server error.

Invalid property type
GET /api/v1/properties?propertyType=hotel

Expected behaviour:

400 INVALID_QUERY_PARAMETERS
Successful property-detail request
GET /api/v1/properties/demo-green-view-residence-10000000-000

Confirmed:

Property information was returned.
Approximate location was returned.
Exact location remained protected.
Property amenities were returned.
Unit information was returned.
Base rent was returned.
The refundable caution fee was returned.
Unit amenities were returned.
Approved media metadata was returned.
The media URL remained null.
Remaining Pre-Merge Tests

The following tests must still be run or reconfirmed before merging:

Invalid page number
Invalid limit
Limit greater than 50
Invalid country code
Unsupported characters in location filters
Invalid slug format
Valid but nonexistent slug
Draft-property privacy test
Unverified-property privacy test
Exact-address absence
Exact-coordinate absence
Provider-identity absence
Stable sorting
Page beyond the last available page
Backend error-contract consistency
git diff --check
Final branch diff review
Current Result

The public request flow is now:

Visitor
  ↓
Express route
  ↓
Controller
  ↓
Zod validation
  ↓
Service
  ↓
Supabase client using publishable key
  ↓
PostgreSQL permissions and RLS
  ↓
Controlled public response

The backend can return a verified property with:

General and approximate location
Available units
Property amenities
Unit amenities
Base rent
Transparent fees
Approved media metadata

It does this without exposing:

Exact address
Exact coordinates
Provider identity
Administrator identity
Private property states
Secret credentials
Lessons Learned
Database security and API response security should reinforce each other.
Public APIs should explicitly define the fields they expose.
Secure systems often require additional permission design and testing.
Correct pricing requires comparing values within compatible units.
Database migrations are a historical record and should remain immutable after deployment.
Demonstration data and database structure have different lifecycles.
Validation should happen before database operations.
Consistent error responses improve security and client integration.
File paths depend on the terminal’s current working directory.
A feature is not complete until its implementation, tests and documentation agree.
Sprint Review

The core implementation goal was achieved.

The public property-list and property-detail endpoints are working. The API returns verified property data, supports filtering and pagination, exposes transparent fees and protects sensitive fields.

The implementation was committed and pushed to:

feature/public-property-catalogue

The branch was confirmed to be synchronized with its remote counterpart, with a clean working tree before documentation work resumed.

The feature is not yet merged into main because documentation, final testing and Pull Request review remain outstanding.

Sprint Retrospective
What went well
The first public product feature now works end to end.
Database security remained active throughout the public request flow.
Exact property locations and provider information remained protected.
Transparent fee disclosure was incorporated into the data model and API.
Positive, empty-state and negative behaviours were considered.
The feature was developed on an isolated branch.
Implementation problems were investigated rather than bypassed.
What could be improved
Documentation should be updated during implementation rather than after the code is finished.
A formal test checklist should be created before development begins.
Automated tests should replace repeated manual endpoint testing.
Shell commands should state the required working directory.
API documentation should be updated whenever the response contract changes.
Sprint backlog status should be updated at the end of each development session.
Actions for the next sprint
Define documentation and testing tasks in the sprint backlog from the beginning.
Add automated service and controller tests.
Add API integration tests.
Maintain ADRs alongside implementation decisions.
Include privacy tests in every public endpoint review.
Keep the README and changelog synchronized with merged features.
Definition of Done

Sprint 1 will be complete when:

 Public property-list endpoint works.
 Public property-detail endpoint works.
 Pagination works.
 Filters and sorting work.
 Public input is validated.
 Published and verified records are protected by RLS.
 Exact locations and private fields are excluded.
 Transparent fees are returned.
 Demonstration seed data is available.
 Implementation is committed and pushed.
 API documentation is updated.
 Architecture decision records are added.
 Final regression and privacy tests pass.
 Pull Request is opened and reviewed.
 Feature is merged into main.
 Sprint status is changed to Completed.
Next Steps
Update docs/api/public-catalog-api.md.
Create the public-catalogue architecture decision records.
Update README.md.
Update CHANGELOG.md.
Correct the demonstration description typo.
Run the final regression and privacy test matrix.
Review the complete feature-branch diff.
Commit and push the documentation changes.
Open the Pull Request.
Review and merge the feature into main.
Mark Sprint 1 as completed.