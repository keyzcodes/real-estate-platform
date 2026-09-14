# Sprint 4: Self-Service Authentication and Provider Access

## Status

Planned

## Planning Date

12 September 2026

## Decision Owner

Sunday Jime

## Planning Branch

`docs/sprint-04-closed-provider-pilot`

## Proposed Implementation Branch

`feature/self-service-provider-authentication`

## Sprint Goal

Allow seekers and property providers to authenticate securely while keeping the
public catalogue open to anonymous visitors.

A provider must be enrolled automatically, enter a protected provider workspace
without administrator role approval and remain unable to verify or publish
listings.

## Context

Sprint 3 completed the responsive public property catalogue.

The original product requirements required the administrator to enter every
listing and postponed provider onboarding. That approach has been replaced by
self-service provider registration because real providers and internal testers
must eventually enter information from their own devices.

Authentication must be implemented before provider property forms because all
future provider records will depend on a verified user UUID, authoritative roles
and tested ownership boundaries.

ADR-010 defines the applicable authentication and authorization contract.

## Expected Sprint Outcome

At the end of Sprint 4:

1. Anonymous visitors can still browse the public catalogue.
2. A visitor can choose seeker or provider registration.
3. Supabase Auth can establish and restore a frontend session.
4. A seeker receives only seeker access.
5. A provider receives provider access automatically.
6. A provider can enter a protected workspace.
7. Express validates authenticated access tokens.
8. Express checks profile status and required roles.
9. The database prevents arbitrary role assignment.
10. Provider enrolment cannot grant administrator access.
11. Existing public, backend and database tests continue passing.

Sprint 4 does not yet allow providers to create complete property listings.

## Scope

### Included

- Authentication architecture
- Frontend Supabase client
- Seeker and provider registration choices
- Sign-in and sign-out
- Authentication callback handling
- Frontend session state
- Automatic provider enrolment
- Current-user API response
- Backend token-validation middleware
- Active-profile checks
- Role authorization
- Protected provider route
- Provider-workspace foundation
- Authentication-specific rate limiting
- Controlled authentication errors
- Database function permissions
- Frontend authentication tests
- Backend authentication tests
- PostgreSQL authorization tests
- Supabase redirect configuration review
- Authentication security documentation
- Full regression testing

### Excluded

- Provider property-creation forms
- Property, unit and fee write APIs
- Cloudinary upload implementation
- 360-degree panorama display
- Provider analytics
- Provider identity automation
- Listing verification automation
- Listing publication by providers
- Dedicated administrator interface
- Additional administrator accounts
- Exact-location disclosure
- Booking and payments
- Paid authentication or email services
- Browser end-to-end tests before staging is stable

## Access Model

### Anonymous Visitor

An anonymous visitor may:

- Browse the catalogue
- Open eligible property details
- View approved public information

An anonymous visitor may not access account or provider endpoints.

### Property Seeker

A seeker may:

- Authenticate
- Read their own safe profile information
- Use future seeker features

A seeker may not access the provider workspace or provider endpoints.

### Property Provider

A provider may:

- Authenticate
- Hold both seeker and provider roles
- Read their own safe profile and roles
- Access the protected provider-workspace foundation

Provider property mutations remain disabled until the following sprint adds
tested ownership policies and write APIs.

### Administrator

The existing administrator account remains unchanged.

Sprint 4 will not:

- Create another administrator
- Offer administrator registration
- Add an administrator link to public navigation
- Build an administrator dashboard

Initial administration remains outside the public interface.

## Provider Enrolment Contract

The existing new-user trigger creates:

- One profile
- The baseline `property_seeker` role

When an authenticated user completes provider registration, a controlled
operation will add `property_provider` automatically.

The provider will not wait for manual administrator approval.

The enrolment operation must:

- Derive the profile UUID from `auth.uid()`
- Reject unauthenticated calls
- Reject suspended profiles
- Add only `property_provider`
- Never accept a general role parameter
- Never add `admin`
- Be safe to repeat
- Preserve existing roles
- Return a controlled result

The frontend must never receive permission to insert arbitrary role records.

## Backend Authentication Contract

Authenticated requests use the header:

`Authorization: Bearer <access-token>`

The backend must:

1. Parse the authorization header.
2. Reject missing or malformed bearer tokens.
3. Validate the access token with Supabase Auth.
4. Obtain the UUID from the validated user.
5. Read the user's active profile.
6. Read authoritative roles from `public.user_roles`.
7. Attach a minimal authenticated-user object to the request.
8. Create a request-scoped Supabase client carrying the token when required.
9. Return controlled errors without exposing internal details.

The backend must not authorize using a UUID or role supplied by the frontend.

## Proposed API Endpoints

### Get Current Account

`GET /api/v1/auth/me`

Requires authentication.

Returns only approved account information, such as:

- Profile UUID
- Full name
- Avatar URL
- Account status
- Authoritative roles

It must not return internal authentication records or administrative metadata.

### Enrol as Provider

`POST /api/v1/auth/provider-enrolment`

Requires authentication.

The endpoint:

- Uses the authenticated UUID
- Calls the narrowly scoped provider-enrolment operation
- Is safe to retry
- Returns the resulting safe role set
- Cannot accept `admin` or another requested role

### Provider Workspace Check

`GET /api/v1/provider/workspace`

Requires:

- A valid authenticated session
- An active profile
- The `property_provider` role

It returns only the minimal data needed to prove protected provider access.

## Frontend Routes

Sprint 4 will add:

- `/join`
- `/sign-in`
- `/auth/callback`
- `/provider`

The `/join` page will present:

- Find a property
- List a property

The public catalogue remains available without registration.

The provider route must show a controlled loading state while the session and
roles are being established.

A user without provider access must not see protected provider content.

Frontend route protection improves usability, but backend and database
authorization remain mandatory.

## Authentication Method Review

Supabase Auth remains the identity provider.

Google OAuth is the preferred initial option for external pilot users because it
does not depend on the current default email-delivery limitation.

Before enabling it, the implementation must verify:

- No billing or payment method is required
- The Google OAuth client is configured correctly
- Local callback URLs are correct
- Staging callback URLs are added only after hosting is selected
- Production secrets are not committed
- Existing administrator access remains functional

If Google OAuth introduces an unexpected payment requirement, configuration must
stop and be reported before proceeding.

Phone authentication and anonymous authentication remain disabled.

## Supabase Client Separation

The backend will preserve two client purposes:

### Public Client

Uses the Supabase publishable key without a user session.

Used only for anonymous public-catalogue operations.

### Authenticated Request Client

Created for one authenticated request using:

- Supabase URL
- Supabase publishable key
- Validated user access token
- Disabled backend session persistence

This allows PostgreSQL policies to evaluate the current user's UUID.

A service-role key will not be introduced for ordinary Sprint 4 operations.

## Security Requirements

Sprint 4 must protect against:

- Arbitrary role insertion
- Administrator self-assignment
- Client-supplied identity spoofing
- Missing access tokens
- Malformed authorization headers
- Invalid or expired tokens
- Suspended-account access
- Cross-user profile access
- Authentication error enumeration
- Excessive authentication requests
- Open redirects
- Secrets in frontend code
- Accidental changes to anonymous catalogue visibility

Public route names are not security controls.

## Error Contract

Protected endpoints will use controlled responses.

Examples of error codes include:

- `AUTHENTICATION_REQUIRED`
- `INVALID_ACCESS_TOKEN`
- `ACCOUNT_INACTIVE`
- `PROVIDER_ACCESS_REQUIRED`
- `AUTHENTICATION_SERVICE_UNAVAILABLE`
- `PROVIDER_ENROLMENT_FAILED`

Responses must not expose:

- Raw Supabase errors
- SQL errors
- JWT contents
- Stack traces
- Secret keys
- Whether another private account exists

## Database Changes

Sprint 4 may add a forward-only migration containing:

- A narrowly scoped provider-enrolment function
- Explicit execute permissions
- Supporting authorization helper functions when justified
- Comments describing the security boundary

Previously applied migrations must not be edited.

The migration must use:

- Fully qualified object names
- A controlled `search_path`
- The authenticated UUID
- A hard-coded provider role
- Idempotent insertion

Property-write policies are deferred until the property-submission data model is
reviewed for the following sprint.

## Sprint Backlog

| ID     | Task                                                   | Status  |
| ------ | ------------------------------------------------------ | ------- |
| S4-001 | Review profiles, roles, triggers and current RLS       | Done    |
| S4-002 | Review Supabase authentication configuration           | Done    |
| S4-003 | Confirm the existing administrator account             | Done    |
| S4-004 | Record ADR-010                                         | Done    |
| S4-005 | Update the product requirements                        | Done    |
| S4-006 | Update the README status and roadmap                   | Done    |
| S4-007 | Create the Sprint 4 plan                               | Done    |
| S4-008 | Review and merge the Sprint 4 planning branch          | Pending |
| S4-009 | Create the Sprint 4 implementation branch              | Pending |
| S4-010 | Add frontend Supabase dependency                       | Pending |
| S4-011 | Add documented frontend Supabase environment variables | Pending |
| S4-012 | Create the frontend Supabase client                    | Pending |
| S4-013 | Create authentication session context                  | Pending |
| S4-014 | Build the Join page                                    | Pending |
| S4-015 | Build the generic Sign-in page                         | Pending |
| S4-016 | Add authentication callback handling                   | Pending |
| S4-017 | Preserve provider-registration intent safely           | Pending |
| S4-018 | Add automatic provider enrolment migration             | Pending |
| S4-019 | Restrict provider enrolment to the authenticated UUID  | Pending |
| S4-020 | Make provider enrolment idempotent                     | Pending |
| S4-021 | Add backend bearer-token parsing                       | Pending |
| S4-022 | Add backend access-token validation                    | Pending |
| S4-023 | Add active-profile enforcement                         | Pending |
| S4-024 | Add authoritative role lookup                          | Pending |
| S4-025 | Add request-scoped authenticated Supabase client       | Pending |
| S4-026 | Add `GET /api/v1/auth/me`                              | Pending |
| S4-027 | Add `POST /api/v1/auth/provider-enrolment`             | Pending |
| S4-028 | Add provider-role authorization middleware             | Pending |
| S4-029 | Add the protected provider-workspace endpoint          | Pending |
| S4-030 | Build the protected provider-workspace foundation      | Pending |
| S4-031 | Add sign-out and session-expiry handling               | Pending |
| S4-032 | Add controlled authentication error states             | Pending |
| S4-033 | Add authentication-specific rate limiting              | Pending |
| S4-034 | Add frontend authentication tests                      | Pending |
| S4-035 | Add backend authentication and authorization tests     | Pending |
| S4-036 | Add pgTAP provider-enrolment and role tests            | Pending |
| S4-037 | Re-run public catalogue regression tests               | Pending |
| S4-038 | Review responsive and accessible authentication UI     | Pending |
| S4-039 | Review Supabase URL and redirect configuration         | Pending |
| S4-040 | Configure the approved zero-cost authentication method | Pending |
| S4-041 | Perform controlled local manual verification           | Pending |
| S4-042 | Update security and API documentation                  | Pending |
| S4-043 | Review the complete implementation diff                | Pending |
| S4-044 | Open and review the Sprint 4 implementation PR         | Pending |
| S4-045 | Merge only after all required checks pass              | Pending |
| S4-046 | Complete the Sprint 4 review and retrospective         | Pending |

## Testing Strategy

### Frontend Tests

Frontend tests must verify:

- Public routes remain available without authentication
- Join page presents seeker and provider choices
- Authentication loading state is accessible
- Authentication errors are controlled
- Provider intent triggers provider enrolment
- Seekers cannot render provider workspace content
- Providers can render the provider-workspace foundation
- Sign-out clears protected access
- Session expiry returns the user to a safe state

Supabase network behaviour must be mocked in deterministic component tests.

### Backend Tests

Backend tests must verify:

- Missing authorization header is rejected
- Non-Bearer authorization header is rejected
- Invalid token is rejected
- Valid user identity is attached safely
- Suspended profile is rejected
- Seeker is rejected from provider endpoints
- Provider is accepted by provider endpoints
- Provider enrolment ignores client-supplied role values
- Internal authentication errors are sanitized
- Public endpoints remain anonymous

### Database Tests

Disposable pgTAP tests must verify:

- Anonymous users cannot execute provider enrolment
- Authenticated users can enrol only themselves
- Enrolment adds only `property_provider`
- Enrolment cannot add `admin`
- Repeated enrolment does not duplicate roles
- Suspended profiles cannot enrol
- Existing roles remain intact
- Users can still select only their own roles
- Direct role mutation remains unavailable
- Production data and credentials are never used

## Manual Verification

Manual verification will confirm:

- Anonymous catalogue browsing
- Seeker registration
- Provider registration
- Automatic provider enrolment
- Provider workspace access
- Seeker denial from provider workspace
- Sign-out
- Expired-session behaviour
- Browser refresh with an active session
- Mobile and desktop layouts
- Keyboard navigation
- Generic error messages
- Existing administrator account remains unchanged

No additional administrator account will be created.

## Cost Controls

Sprint 4 must not:

- Add a credit card
- Enable a paid Supabase feature
- Configure paid SMTP
- Enable a paid identity provider
- Create paid hosting
- Enable Cloudinary paid features

Cloudinary upload implementation is outside Sprint 4.

Any screen requesting payment or billing information is a stop condition that
must be reported before continuing.

## Risks and Mitigations

### Role Escalation

Mitigation:

- Do not accept arbitrary roles
- Hard-code provider enrolment
- Preserve direct role-table restrictions
- Add database tests

### Token Spoofing

Mitigation:

- Validate tokens with Supabase
- Ignore client-supplied UUIDs
- Use request-scoped authenticated clients

### Signup Abuse

Mitigation:

- Preserve Supabase rate limits
- Add application rate limits
- Review CAPTCHA before unrestricted public release
- Keep provider capabilities non-publication privileges

### Redirect Misconfiguration

Mitigation:

- Use exact approved redirect URLs
- Test local and staging callbacks separately
- Avoid wildcard production redirects

### Public Catalogue Regression

Mitigation:

- Preserve the anonymous API client
- Run the complete existing regression suite
- Test public routes without a session

## Definition of Done

Sprint 4 is complete when:

- [ ] The planning branch has been reviewed and merged.
- [ ] The implementation branch has been created from current `main`.
- [ ] Public catalogue access still works without authentication.
- [ ] The Join page offers seeker and provider paths.
- [ ] Sign-in, callback and sign-out work.
- [ ] Frontend session restoration works.
- [ ] Provider enrolment is automatic.
- [ ] Provider enrolment cannot grant administrator access.
- [ ] Provider enrolment is idempotent.
- [ ] Express validates access tokens.
- [ ] Suspended profiles are denied.
- [ ] Role authorization uses authoritative database records.
- [ ] Seekers cannot access provider endpoints.
- [ ] Providers can access the protected provider workspace.
- [ ] No property-write capability has been accidentally exposed.
- [ ] Existing administrator access remains unchanged.
- [ ] No paid service has been enabled.
- [ ] Frontend authentication tests pass.
- [ ] Backend authentication tests pass.
- [ ] PostgreSQL authorization tests pass.
- [ ] Existing frontend tests pass.
- [ ] Existing backend tests pass.
- [ ] Existing public RLS tests pass.
- [ ] Frontend lint passes.
- [ ] Frontend production build passes.
- [ ] Required documentation is updated.
- [ ] The complete diff has been reviewed.
- [ ] Required CI checks pass.
- [ ] The implementation PR is reviewed and merged.
- [ ] The sprint review and retrospective are completed.

## Expected Sprint Result

At the end of Sprint 4, anonymous visitors will retain frictionless catalogue
access, seekers will be able to authenticate without provider permissions and a
new provider will be enrolled automatically into a protected workspace.

The sprint will establish the trusted identity and authorization foundation
required before provider property-entry forms and Cloudinary uploads are added.
