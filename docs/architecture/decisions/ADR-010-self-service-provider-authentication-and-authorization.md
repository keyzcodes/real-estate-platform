# ADR-010: Self-Service Provider Authentication and Authorization

## Status

Accepted

## Date

12 September 2026

## Decision Owner

Sunday Jime

## Related Decisions

- ADR-001: Technology Stack
- ADR-002: Database and Supabase Selection
- ADR-004: Media Storage and Virtual Tours
- ADR-005: Protect Exact Property Locations
- ADR-006: Transparent Rental Pricing
- ADR-007: Public API Security and Migration Strategy
- ADR-008: Automated Testing Strategy
- ADR-009: Frontend Visual Design System

## Context

The public property catalogue currently allows anonymous visitors to inspect
published and verified properties.

The original Phase 1 requirements postponed provider onboarding and required the
administrator to enter every listing. That model would make the administrator a
data-entry bottleneck and would prevent property providers and internal testers
from evaluating the real listing-submission experience.

The revised MVP requires:

- Anonymous public catalogue access
- Optional seeker registration
- Self-service provider registration
- Immediate access to a protected provider workspace
- Strict UUID-based ownership
- Administrator control over verification and publication
- Protection against role escalation
- No public administrator registration
- No ordinary provider operation that bypasses Row Level Security

Provider access must be convenient without treating every registered provider or
submitted listing as trusted.

## Decision

### Hybrid Access Model

Visitors may browse public listings without registering.

The platform will provide separate registration choices for:

1. Property seeker
2. Property provider

Registration will be required only for authenticated features.

Administrator registration will never be offered publicly.

### Seeker Registration

A seeker account receives the `property_seeker` role.

A seeker cannot:

- Access provider-management endpoints
- Create property drafts
- Upload property media
- Submit listings
- Verify or publish listings
- Access administrator functions

### Provider Registration

A user who completes the provider registration path will receive the
`property_provider` role automatically.

Manual administrator approval is not required before entering the provider
workspace.

Because the existing signup automation creates a baseline
`property_seeker` role, a provider may hold both:

- `property_seeker`
- `property_provider`

The role model supports multiple roles for one UUID.

Provider enrolment must be automatic, transactional and safe to retry.

### Trusted Provider Enrolment

The frontend must not insert arbitrary records into `public.user_roles`.

After authentication, the provider-registration flow will call a narrowly
scoped backend or database operation that:

- Uses the UUID from the authenticated session
- Confirms that the profile is active
- Adds only the `property_provider` role
- Cannot add the `admin` role
- Creates the related provider profile when required
- Defaults provider verification to `unverified`
- Handles repeated requests without creating duplicate roles
- Records appropriate timestamps

The operation must not accept a general role parameter.

Client-editable authentication metadata may record registration intent, but it
must not be used as the authorization source of truth.

Database roles and policies remain authoritative.

### Role Is Not Verification

The `property_provider` role means that the account may use provider features.

It does not mean that:

- The person's identity has been verified
- Their relationship to a property has been verified
- Their media has been approved
- Their prices have been confirmed
- Their listing may be published
- They may display a verified-provider badge

Provider verification will be stored separately and will initially default to
`unverified`.

Provider type and verification status must not be inferred from the
`property_provider` role.

### Provider Capabilities

An authenticated provider may:

- Access the protected provider workspace
- Create property drafts
- Read their own private drafts
- Edit their own eligible drafts
- Add related units, fees, amenities and location information
- Upload media for properties they own according to ADR-004
- Submit a completed draft for review
- Read the review outcome for their own submissions
- Correct and resubmit a returned listing

A provider may not:

- Access another provider's private records
- Change a property's owner
- Add or remove authorization roles
- Modify provider-verification fields
- Modify property-verification fields
- Modify administrator-review fields
- Publish, unpublish or archive a property
- Approve property media
- Read private administrator information
- Read another provider's exact location data

### Authentication Architecture

Supabase Auth remains the identity provider.

The React application will obtain a Supabase access token for the authenticated
session.

Authenticated API requests will send:

`Authorization: Bearer <access-token>`

Express will:

1. Reject missing or malformed authorization headers.
2. Validate the access token with Supabase Auth.
3. Obtain the signed-in user's UUID from the validated identity.
4. Confirm that the user's profile is active.
5. Confirm the role required by the endpoint.
6. Create a request-scoped Supabase client carrying the user's token.
7. Allow PostgreSQL permissions and Row Level Security to enforce access.

The existing publishable-key client will remain available for anonymous
catalogue requests.

A Supabase service-role key will not be used for ordinary seeker or provider
requests.

### Authorization Source

Express must not authorize a request using:

- A UUID supplied in the request body
- A profile ID supplied in the URL without ownership verification
- Client-editable user metadata
- A role supplied by the frontend
- A hidden frontend route
- Frontend conditional rendering alone

Authorization must use the validated authenticated UUID and authoritative
database records.

### UUID Ownership

Provider ownership will use the existing relationship:

`properties.created_by = auth.uid()`

A UUID foreign key proves that the referenced profile exists.

The equality check enforced through Row Level Security proves that the current
authenticated user owns the record.

Policies for child records must derive ownership through the parent property.

This applies to:

- Property locations
- Property units
- Unit fees
- Property amenities
- Unit amenities
- Property media
- Virtual tours and their scenes

Provider A must never be able to read or modify Provider B's private resources.

### Column Protection

Provider write permissions will be limited to approved listing-content columns.

Providers must not receive update permission for:

- `created_by`
- Verification status
- Verification timestamps
- Verifier identifiers
- Publication status
- Publication timestamps
- Reviewer identifiers
- Review notes intended only for administrators
- Audit fields controlled by database functions

Submission actions that change protected workflow fields must use controlled
backend or database operations rather than unrestricted updates.

### Listing Review and Publication

A provider-created property begins as a private draft.

The workflow will distinguish:

1. Drafting
2. Submitted for review
3. Returned or rejected
4. Verified
5. Published
6. Unpublished or archived

Providers may save incomplete drafts.

Only an administrator may:

- Record verification results
- Approve or reject media
- Mark a property as verified
- Publish, unpublish or archive a property

The existing database rule that permits publication only after verification
remains active.

Additional workflow timestamps and review information will be added through
forward-only migrations when the submission workflow is implemented.

### Administrator Access

The existing administrator account remains the only administrator during the
initial pilot.

The public registration interface will not offer an administrator option.

A dedicated administrator interface is not required for the first provider
pilot. Initial review and publication may be performed through the Supabase
Dashboard.

If a platform administrator interface is introduced later, it will use normal
authentication plus backend and database authorization.

Security must not depend on attackers being unable to discover an administrator
URL.

### Media Integration

ADR-004 remains authoritative for property media.

In particular:

- Cloudinary stores public property photos, videos and panoramas
- PostgreSQL stores media metadata
- Express authorizes and signs uploads
- The browser uploads directly to Cloudinary
- Cloudinary secrets remain on the backend
- Media begins in pending status
- Only approved media is exposed through the public catalogue
- Pannellum displays supported 360-degree panorama scenes

This decision does not replace or duplicate ADR-004.

Provider media-upload signatures must not be issued until authentication,
provider role and property ownership have all been confirmed.

### Exact Location Privacy

ADR-005 remains authoritative for location privacy.

Providers may manage exact location information only for properties they own.

Anonymous visitors continue receiving only approved approximate location
information.

Provider onboarding must not weaken the existing public-location contract.

### Pricing Integrity

ADR-006 remains authoritative for rental pricing.

Provider forms must preserve:

- Unit-level base rent
- Currency
- Billing period
- Separate mandatory and optional fees
- Refundable status
- Payment frequency
- Declared agent fees when supported

Provider convenience must not reduce pricing transparency.

### Abuse and Cost Protection

Self-service provider registration increases the risk of spam, automated account
creation and media-quota abuse.

Controls will include:

- Supabase authentication rate limits
- Application rate limits
- Email or identity confirmation where applicable
- CAPTCHA before unrestricted public signup when required
- Strict validation
- Per-user draft limits
- Per-property media limits
- Short-lived signed Cloudinary uploads
- File type and size restrictions
- Monitoring and removal of rejected or abandoned media
- Generic authentication error responses

No paid authentication, storage, media or abuse-protection feature may be
enabled without the decision owner's explicit approval.

### Required Testing

ADR-008 remains authoritative and will be extended for authenticated access.

The required security actors are:

- Anonymous visitor
- Authenticated seeker
- Provider A
- Provider B
- Administrator
- Suspended user

Tests must prove that:

- Anonymous access to the public catalogue still works
- A seeker cannot use provider endpoints
- Provider enrolment cannot grant the administrator role
- Provider enrolment is safe to retry
- Provider A can manage only Provider A's eligible drafts
- Provider A cannot access Provider B's private records
- Providers cannot change ownership
- Providers cannot set verification or publication fields
- Providers cannot approve media
- Suspended profiles cannot use protected operations
- Missing, invalid and expired tokens are rejected
- Exact locations remain absent from public responses
- Draft and unverified records remain absent from public responses

Database security tests must run against a disposable environment and must never
use production credentials or production data.

## Alternatives Considered

### Continue administrator-only listing entry

Rejected because it creates unnecessary manual work and prevents meaningful
provider testing.

### Require manual approval before granting every provider role

Rejected because draft creation is low privilege when ownership, verification
and publication are correctly separated.

### Let the frontend write any requested role

Rejected because a malicious client could attempt to assign the administrator
role.

### Use editable authentication metadata as authorization

Rejected because user-editable metadata is not a trusted authorization source.

### Automatically publish provider submissions

Rejected because unreviewed, misleading or malicious content could become
public.

### Depend on a hidden administrator login page

Rejected because undiscoverable URLs are not a security boundary.

### Use a service-role key for normal provider operations

Rejected because privileged credentials may bypass Row Level Security and
increase the impact of backend mistakes.

## Consequences

### Positive

- Providers can begin entering information without administrator data entry.
- Provider onboarding does not require manual role approval.
- Public catalogue access remains frictionless.
- Provider capabilities are separated from verification and publication.
- UUID ownership is enforced consistently.
- Existing media, location, pricing and testing decisions remain valid.
- The design can support a small pilot and later public growth.

### Negative

- Self-service registration increases spam and abuse risk.
- Authentication and ownership policies require extensive testing.
- Providers may create incomplete or low-quality drafts.
- Administrators must still review submissions during the pilot.
- Role, verification and publication states require clear interface wording.
- Media limits must be enforced to protect the Cloudinary allowance.

## Implementation Boundary

This decision authorizes the design and implementation of authentication,
provider enrolment and protected provider access.

It does not authorize:

- Creating additional administrator accounts
- Enabling paid services
- Enabling arbitrary public uploads
- Weakening existing public RLS policies
- Publishing unreviewed listings
- Exposing exact locations publicly
- Introducing payments or bookings

Supabase configuration changes must be documented and reviewed before they are
applied.

## Review Triggers

Review this decision when:

- Provider signup is marketed to a large public audience
- Manual listing review becomes a bottleneck
- Automated identity or listing verification is introduced
- A dedicated administrator interface is introduced
- Multiple administrator permission levels are required
- Provider media usage approaches Cloudinary limits
- Exact-location disclosure is introduced
- Payments or bookings are introduced
