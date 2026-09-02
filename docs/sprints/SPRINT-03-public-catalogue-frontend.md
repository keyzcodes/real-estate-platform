# Sprint 3 — Public Property Catalogue Frontend

## Sprint Information

| Item                | Value                                |
| ------------------- | ------------------------------------ |
| Sprint              | Sprint 3                             |
| Status              | In Progress                          |
| Start date          | 2 September 2026                     |
| Planned duration    | One week                             |
| Developer           | Sunday Jime                          |
| Development process | Agile, iterative development         |
| Feature branch      | `feature/public-catalogue-frontend`  |
| Target branch       | `main`                               |

## Sprint Goal

Build the first public-facing React interface for browsing and viewing verified rental properties.

The frontend must consume the existing Express catalogue API, display rental information transparently and preserve the privacy boundaries established by the backend.

## Problem Being Solved

The backend can return safe property information, but visitors currently need an API client or terminal command to use it.

Property seekers need a clear visual interface where they can:

- Browse available properties
- Understand where a property is generally located
- Compare compatible rental prices
- See available-unit counts
- Filter the catalogue
- Open complete property details
- Review rent and additional fees separately
- Understand loading, empty and error states

## User Stories

### Browse properties

As a visitor, I want to see published and verified properties in a visual catalogue so that I can discover available rental options.

### Filter properties

As a visitor, I want to filter properties by supported location and property-type fields so that I can narrow the results.

### Understand prices

As a visitor, I want prices grouped by currency and billing period so that monthly and yearly obligations are not compared incorrectly.

### View property details

As a visitor, I want to open one property and review its location, units, amenities and fees.

### Understand additional charges

As a visitor, I want base rent and additional fees displayed separately so that I can understand the real rental obligation.

### Receive clear feedback

As a visitor, I want clear loading, empty and error states so that I understand what the application is doing.

### Use different devices

As a visitor, I want the catalogue to work on mobile phones, tablets and desktop screens.

## Sprint Scope

Sprint 3 includes:

- Review of the existing React application
- Frontend catalogue architecture
- Frontend API-client configuration
- Public property-list page
- Reusable property cards
- Starting-price presentation
- Approximate-location presentation
- Available-unit count
- Supported catalogue filters
- Newest and oldest sorting
- Pagination controls
- Property-detail page
- Property and unit amenities
- Base-rent presentation
- Additional-fee presentation
- Media-placeholder behaviour
- Loading states
- Empty states
- Error states
- Not-found state
- Responsive layouts
- Basic accessibility
- Frontend component tests
- Frontend integration tests
- Documentation
- Pull Request review

## Out of Scope

Sprint 3 does not include:

- Property creation
- Property editing
- Authentication interface
- Provider onboarding
- Administrator dashboard
- Booking
- Payments
- Exact-location disclosure
- Google Maps integration
- Cloudinary upload integration
- Working property-image URLs
- Virtual-tour interface
- Direct provider contact
- Reports and moderation
- Undocumented backend filters

## Existing Backend Contract

The frontend will consume:

### List properties

```http
GET /api/v1/properties
```

Supported query parameters:

| Parameter      | Purpose |
| -------------- | ------- |
| `page`         | Select the result page |
| `limit`        | Select results per page |
| `country`      | Filter by two-letter country code |
| `state`        | Filter by state or region |
| `city`         | Filter by city |
| `area`         | Filter by local area |
| `propertyType` | Filter by supported property type |
| `sort`         | Sort using `newest` or `oldest` |

### Property details

```http
GET /api/v1/properties/:slug
```

The frontend must not assume support for filters that the backend has not implemented.

## Design Principles

### Transparency first

Base rent and additional fees must remain visibly separate.

### Privacy first

The frontend must never request, reconstruct or display:

- Exact street addresses
- Exact latitude
- Exact longitude
- Provider identifiers
- Administrator identifiers
- Uploader identifiers
- Private storage information

### Mobile first

The interface should be usable on common mobile-screen sizes before desktop enhancements are added.

### Accessible interaction

Interactive elements must support:

- Descriptive labels
- Keyboard navigation
- Visible focus states
- Appropriate HTML elements
- Useful alternative text
- Sufficient colour contrast

### Honest media behaviour

The API currently returns `url: null` for property media.

The frontend must display an intentional placeholder rather than a broken image or invented URL.

### Contract-driven development

Frontend components must follow the documented API response instead of relying on database column names.

## Proposed Frontend Structure

```text
frontend/src/
├── api/
│   └── propertyApi.js
├── components/
│   ├── catalogue/
│   │   ├── CatalogueFilters.jsx
│   │   ├── Pagination.jsx
│   │   ├── PropertyCard.jsx
│   │   └── StartingPrices.jsx
│   ├── feedback/
│   │   ├── EmptyState.jsx
│   │   ├── ErrorState.jsx
│   │   └── LoadingState.jsx
│   └── properties/
│       ├── FeeList.jsx
│       ├── PropertyAmenities.jsx
│       ├── PropertyLocation.jsx
│       ├── PropertyMedia.jsx
│       └── PropertyUnits.jsx
├── pages/
│   ├── PropertyCataloguePage.jsx
│   ├── PropertyDetailsPage.jsx
│   └── PropertyNotFoundPage.jsx
├── routes/
│   └── AppRoutes.jsx
├── styles/
└── tests/
```

This structure is provisional and may be adjusted after inspecting the existing frontend.

## State Model

The catalogue interface must represent these states explicitly:

```text
Initial
→ Loading
→ Success with properties
→ Success with empty results
→ Validation or request error
→ Retry
```

The property-detail interface must represent:

```text
Initial
→ Loading
→ Property found
→ Property not found
→ Request error
→ Retry
```

## Pricing Presentation Rules

The list page must display every entry in `startingPrices`.

Example:

```text
From ₦300,000 yearly
From ₦30,000 monthly
```

The frontend must not select one smallest number across incompatible billing periods or currencies.

The detail page must distinguish:

- Base rent
- Mandatory one-time fees
- Mandatory recurring fees
- Optional fees
- Refundable fees

Fees must not be combined into an unexplained total.

## Location Presentation Rules

The public interface may display:

- Country
- State or region
- City
- General area
- Location-verification status

Approximate coordinates may be retained for future map integration, but Sprint 3 will not introduce Google Maps.

The interface must not imply that an approximate location is an exact address.

## Sprint Backlog

| ID     | Task                                                   | Status |
| ------ | ------------------------------------------------------ | ------ |
| S3-001 | Create the frontend feature branch                     | Done |
| S3-002 | Create the Sprint 3 document                           | Done |
| S3-003 | Review the existing frontend structure                 | Done |
| S3-004 | Review frontend dependencies                           | Done |
| S3-005 | Define the frontend catalogue component architecture   | Done |
| S3-006 | Configure the frontend API base URL                    | Done |
| S3-007 | Create the property API client                         | To Do |
| S3-008 | Configure application routes                           | To Do |
| S3-009 | Build the catalogue page                               | To Do |
| S3-010 | Build reusable property cards                          | To Do |
| S3-011 | Display grouped starting prices                        | To Do |
| S3-012 | Display approximate locations                          | To Do |
| S3-013 | Display available-unit counts                          | To Do |
| S3-014 | Build supported filter controls                        | To Do |
| S3-015 | Build newest and oldest sorting controls               | To Do |
| S3-016 | Build pagination controls                              | To Do |
| S3-017 | Synchronize catalogue state with URL parameters        | To Do |
| S3-018 | Build the property-detail page                         | To Do |
| S3-019 | Display property-level amenities                       | To Do |
| S3-020 | Display property units                                 | To Do |
| S3-021 | Display base rent and transparent fees                 | To Do |
| S3-022 | Display unit amenities                                 | To Do |
| S3-023 | Add an intentional media placeholder                   | To Do |
| S3-024 | Implement loading states                               | To Do |
| S3-025 | Implement empty states                                 | To Do |
| S3-026 | Implement API error and retry states                   | To Do |
| S3-027 | Implement the property-not-found state                 | To Do |
| S3-028 | Implement responsive layouts                           | To Do |
| S3-029 | Review keyboard navigation and accessibility           | To Do |
| S3-030 | Configure frontend automated testing                   | To Do |
| S3-031 | Add component tests                                    | To Do |
| S3-032 | Add API-integration tests                              | To Do |
| S3-033 | Run application regression tests                       | To Do |
| S3-034 | Update frontend and API documentation                  | To Do |
| S3-035 | Review the complete branch diff                        | To Do |
| S3-036 | Open and review the Sprint 3 Pull Request              | To Do |
| S3-037 | Merge the frontend catalogue into `main`               | To Do |
| S3-038 | Complete the sprint review and retrospective           | To Do |

## Testing Strategy

Frontend tests should confirm:

- Catalogue loading state appears.
- Property cards render safe API data.
- Every compatible starting-price group is displayed.
- Empty results display a useful message.
- API errors display a controlled retry option.
- Supported filters generate the correct query parameters.
- Pagination changes the requested page.
- Property-detail information renders correctly.
- Base rent and fees remain separate.
- Missing media URLs produce a placeholder.
- A missing property produces a not-found state.
- Sensitive database fields are not expected or rendered.
- Key interactions work with the keyboard.

Backend and database tests must continue passing throughout Sprint 3.

## Security and Privacy Requirements

The frontend must:

- Use only the public Express API.
- Avoid direct access to private catalogue tables.
- Avoid embedding Supabase secret or service-role keys.
- Store only public frontend configuration in Vite environment variables.
- Avoid logging sensitive server responses.
- Avoid constructing exact locations from unavailable data.
- Render API text safely through React.
- Preserve backend validation instead of treating frontend validation as a security boundary.

## Engineering Decisions to Record

During implementation, document decisions involving:

- Native `fetch` versus an HTTP library
- Local component state versus shared state
- URL query parameters versus hidden filter state
- CSS organisation
- Loading-state design
- Pagination behaviour
- Media-placeholder behaviour
- Currency formatting
- Error recovery
- Accessibility
- Frontend testing tools

Each decision should record:

- Decision
- Reason
- Alternative considered
- Why the alternative was not selected
- Trade-off

## Definition of Done

Sprint 3 will be complete when:

- [ ] The existing frontend has been reviewed.
- [ ] The catalogue API client is configured.
- [ ] The catalogue page displays public properties.
- [ ] Property cards display documented safe fields.
- [ ] Starting prices are grouped correctly.
- [ ] Approximate locations are labelled clearly.
- [ ] Supported filters work.
- [ ] Sorting works.
- [ ] Pagination works.
- [ ] Catalogue state is reflected in the URL.
- [ ] The property-detail page works.
- [ ] Base rent and additional fees remain separate.
- [ ] Amenities are displayed.
- [ ] Missing media uses an intentional placeholder.
- [ ] Loading states work.
- [ ] Empty states work.
- [ ] Error and retry states work.
- [ ] Property-not-found handling works.
- [ ] The interface is responsive.
- [ ] Basic accessibility checks pass.
- [ ] Frontend component tests pass.
- [ ] Frontend integration tests pass.
- [ ] Existing backend tests still pass.
- [ ] Existing PostgreSQL and RLS tests still pass.
- [ ] Documentation is updated.
- [ ] The branch is reviewed through a Pull Request.
- [ ] The feature is merged into `main`.
- [ ] The sprint review and retrospective are completed.

## Expected Sprint Result

At the end of Sprint 3, a visitor should be able to use the React application to:

1. Browse verified public properties.
2. Filter and sort the catalogue.
3. move between result pages.
4. Open one property.
5. Review its general location.
6. Review available units.
7. Understand base rent and additional fees.
8. See clear loading, empty, error and not-found states.

The interface must remain aligned with the existing API, security policies and transparency goals.