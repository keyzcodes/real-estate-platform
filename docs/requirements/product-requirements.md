# Product Requirements Document

## Document Control

| Field | Value |
| --- | --- |
| Product | Real Estate Platform |
| Version | 1.1 |
| Updated | 12 September 2026 |
| Decision owner | Sunday Jime |
| Status | Approved for MVP development |

## 1. Product Vision

Create a transparent real-estate marketplace where property seekers can inspect
verified properties, understand the complete rental cost and communicate with
landlords, caretakers or other clearly identified providers.

The platform should reduce unnecessary agent dependence, hidden charges,
misleading listings and the administrator's data-entry workload.

## 2. Initial Market

The first pilot will focus on properties around UNIMAID and Maiduguri.

The public catalogue will remain accessible globally so that people outside the
area can inspect properties for themselves or another person.

Expansion beyond the initial market will occur only after the pilot validates
the listing, verification and provider workflows.

## 3. Problem Statement

Property seekers frequently experience:

- Hidden or inflated agent fees
- Undisclosed additional charges
- Misleading property descriptions
- Fake or outdated property images
- Incorrect property locations
- Outdated availability
- Difficulty inspecting properties remotely
- Difficulty confirming provider identity
- Unclear total move-in cost

Property providers also need a convenient way to:

- Enter listing information without administrator data entry
- Save unfinished work
- Upload accurate property media
- Declare rent and fees transparently
- Submit information for review
- Correct rejected or returned submissions
- Manage only their own properties

## 4. Product Goals

The platform will:

1. Keep public property browsing available without registration.
2. Make property information easy to inspect remotely.
3. Display rent and additional fees separately.
4. Preserve the original currency and billing period.
5. Identify the provider's relationship to the property.
6. Provide accurate but privacy-conscious location information.
7. Show meaningful verification and freshness information.
8. Allow seekers and providers to register through clear account choices.
9. Allow providers to enter and submit their own listing information.
10. Prevent providers from verifying or publishing their own listings.
11. Reduce administrator work to review, correction and publication.
12. Protect every provider's records with UUID ownership and Row Level Security.
13. Provide a foundation for later automated verification and moderation.
14. Remain within approved free-service limits during the MVP.

## 5. Delivery Model

### 5.1 Public Catalogue Foundation

The completed public-catalogue foundation provides:

- Anonymous catalogue access
- Published and verified property filtering
- Property details
- Transparent unit pricing
- Additional fee disclosure
- Approximate location presentation
- Approved media relationships
- Privacy-focused public API responses
- Automated frontend, backend and database-security tests

### 5.2 Self-Service Provider Foundation

The next product increment will provide:

- Seeker and provider registration choices
- Supabase authentication
- Automatic provider enrolment
- Protected provider routes
- UUID-based ownership
- A provider workspace
- Draft and submission foundations
- Administrator-controlled verification and publication

### 5.3 Provider Submission Pilot

The provider pilot will add:

- Provider property forms
- Unit and fee forms
- Amenity selection
- Exact-location entry with protected storage
- Cloudinary media upload
- Prepared 360-degree panorama upload
- Draft saving
- Listing submission
- Administrator review through the Supabase Dashboard
- Correction and resubmission
- Controlled publication

The pilot may be released to a small group before all future marketplace
features are complete.

## 6. MVP Scope

### 6.1 Included

- Public homepage
- Public property catalogue
- Property search and filters
- Property details
- Property photos
- Property videos within configured limits
- Prepared 360-degree panorama scenes
- Approximate public location
- Protected exact location
- Amenities
- Unit-level rent
- Additional fee breakdown
- Provider-type disclosure
- Optional seeker registration
- Self-service provider registration
- Automatic provider-role enrolment
- Protected provider workspace
- Provider-owned drafts
- Provider listing submission
- Administrator verification
- Administrator publication and archival controls
- Cloudinary media storage and delivery
- PostgreSQL media metadata
- Security, accessibility and regression testing
- Staging deployment for pilot feedback

### 6.2 Excluded From the Initial Provider Pilot

- Automatic provider identity verification
- Automatic listing approval
- Automatic publication
- Automated landmark discovery
- Paid geocoding
- Automatic 360-degree tour generation
- Advanced video processing
- Full provider analytics dashboard
- Dedicated in-application administrator dashboard
- Multiple administrator permission levels
- Online booking
- Online payment
- Refunds
- Provider payouts
- Property reviews
- Native mobile applications
- Paid infrastructure without explicit approval

A minimal provider workspace is included. A full business dashboard containing
analytics, leads, revenue and subscription management is excluded.

## 7. User Roles

### 7.1 Visitor

A visitor can:

- Browse published listings
- Search and filter properties
- View property details
- View approved media
- View approximate location information
- View rent and additional fees
- View approved provider information
- Use public inquiry, contact and reporting features when implemented

A visitor cannot:

- View drafts
- View exact addresses or exact coordinates
- Create or edit properties
- Upload property media
- Verify properties
- Access provider or administrator functions

### 7.2 Property Seeker

A registered seeker receives the `property_seeker` role.

A seeker can:

- Use visitor capabilities
- Maintain their own basic profile
- Use future authenticated seeker features

A seeker cannot:

- Use provider-management endpoints
- Create property drafts
- Upload property media
- Submit listings
- Verify or publish listings
- Access administrator functions

Public browsing does not require a seeker account.

### 7.3 Property Provider

A provider receives the `property_provider` role automatically after completing
the provider-registration flow.

A provider may also retain the baseline `property_seeker` role.

A provider can:

- Access the protected provider workspace
- Maintain their provider profile
- Declare their relationship to a property
- Create property drafts
- Read and edit their own eligible drafts
- Add units, fees, amenities and location information
- Upload media for properties they own
- Submit completed drafts for review
- View review results for their submissions
- Correct and resubmit returned listings

A provider cannot:

- Read or edit another provider's private records
- Change property ownership
- Assign authorization roles
- Become an administrator through registration
- Verify themselves
- Verify a property
- Approve property media
- Publish, unpublish or archive a property
- Modify administrator-controlled review or audit fields

The provider role grants workspace capability. It does not represent identity,
property or listing verification.

### 7.4 Administrator

The existing administrator account remains the only administrator during the
initial pilot.

An administrator can:

- Review provider profiles
- Review submitted property information
- Review exact location information
- Review property media
- Approve or reject media
- Record verification results
- Return submissions for correction
- Publish, unpublish and archive properties
- Review inquiries and listing reports when those features are implemented
- Perform controlled moderation and audit actions

Initial administrator operations may use the Supabase Dashboard.

Administrator registration will never be displayed publicly.

## 8. Core Workflows

### 8.1 Seeker Workflow

1. A visitor browses anonymously.
2. The visitor may choose to register as a seeker.
3. The system authenticates the user.
4. The system creates the profile and seeker role.
5. Public catalogue access continues without additional restrictions.

### 8.2 Provider Workflow

1. The user chooses to register as a provider.
2. Supabase authenticates the user.
3. The system creates the user's profile.
4. A controlled operation adds the provider role automatically.
5. Provider verification begins as `unverified`.
6. The provider enters the protected workspace immediately.
7. The provider creates and saves their own draft.
8. The provider adds pricing, fees, amenities, location and media.
9. The provider submits the draft for review.
10. The administrator verifies, rejects or returns the submission.
11. Only an administrator can publish an eligible property.

### 8.3 Publication Workflow

A public property must:

- Be verified
- Have publication status `published`
- Satisfy catalogue-integrity requirements
- Have the required location record
- Have at least one valid unit
- Have an approved cover image
- Expose only privacy-approved public fields

Provider submission never automatically causes publication.

## 9. Functional Requirements

### FR-001: View Published Properties

The system shall display only published and verified properties to anonymous
visitors.

### FR-002: Search Properties

The system shall allow visitors to search using supported property and location
fields.

### FR-003: Filter Properties

The system shall support documented filters such as:

- Property type
- Country
- State or region
- City
- Area
- Price range when compatible
- Billing period
- Number of bedrooms
- Furnishing status
- Amenities
- Provider type
- Availability

### FR-004: View Property Details

The system shall display approved public information including:

- Property title and description
- Property type
- General area
- Approximate map location when available
- Approved photos, videos and panoramas
- Amenities
- Available units
- Property rules
- Pricing
- Verification information

Exact location fields must remain absent from anonymous responses.

### FR-005: Display Transparent Pricing

The system shall display:

- Base rent
- Currency
- Billing period
- Mandatory fees
- Optional fees
- Refundable status
- Payment frequency
- Declared agent fees when supported

Incompatible prices must not be silently combined.

### FR-006: Identify the Provider

The system shall identify the provider's declared relationship to the property,
such as landlord, caretaker, authorised manager or transparent agent when that
provider type is enabled.

A verified-provider label must be shown only after the required verification.

### FR-007: Submit Inquiry

The system shall later allow a visitor or seeker to send an inquiry about an
eligible listing.

### FR-008: Contact Provider

The system shall provide approved contact options according to the future
contact-visibility decision.

### FR-009: Report Listing

The system shall later allow users to report:

- Incorrect price
- Incorrect location
- Fake or outdated media
- Unavailable property
- Hidden fees
- Suspicious provider
- Other misleading information

### FR-010: Manage Properties

An authenticated provider shall be able to create and update only their own
eligible property drafts.

An administrator shall retain moderation and archival authority.

### FR-011: Manage Listing Information

A provider shall be able to maintain the listing information permitted by their
role and the current workflow state.

Protected ownership, verification, publication and review fields must not be
provider-editable.

### FR-012: Manage Media

A provider shall be able to upload, describe, reorder and request removal of
media belonging to their own property.

Media shall enter pending review and shall follow ADR-004.

### FR-013: Manage Fees

A provider shall be able to enter individual fees for units they own.

All fee records must follow ADR-006.

### FR-014: Verify Listings

Only an administrator shall be able to record:

- Physical inspection
- Location confirmation
- Price confirmation
- Availability confirmation
- Media review
- Provider verification where applicable

### FR-015: Register an Account

The system shall present seeker and provider registration choices.

Administrator registration must not be available.

### FR-016: Enrol a Provider

The system shall automatically grant the provider role through a controlled,
idempotent operation that cannot grant the administrator role.

### FR-017: Authenticate Protected Requests

Express shall validate authenticated access tokens before allowing protected
operations.

### FR-018: Enforce Provider Ownership

The system shall use the authenticated UUID and Row Level Security to prevent
cross-provider access.

### FR-019: Submit a Draft for Review

A provider shall be able to submit an eligible owned draft through a controlled
workflow operation.

### FR-020: Control Publication

Only an administrator shall be able to verify and publish a submitted property.

## 10. Non-Functional Requirements

### 10.1 Security

- Secrets must not be committed to Git.
- Authentication must be validated by the backend.
- Authorization must not trust client-supplied UUIDs or roles.
- Provider ownership must use the authenticated UUID.
- Row Level Security must protect exposed tables.
- Column permissions must protect workflow fields.
- Administrator registration must not be publicly available.
- Important administrator actions should be audited.
- Cloudinary uploads must use backend-generated signatures.
- Exact property locations must remain protected.
- Public responses must use explicit data projection.
- Authentication and upload routes must be rate-limited.
- Suspended accounts must be denied protected operations.

### 10.2 Performance

- Public pages should load quickly.
- Listings must use pagination.
- Direct browser uploads must avoid passing large files through Express.
- Images must use appropriate responsive variants.
- Media below the visible screen should be lazy-loaded.
- Videos must not preload automatically.
- Frequently queried columns must be indexed.
- Database queries must return only required fields.

### 10.3 Usability

- The interface must be mobile-first.
- Registration choices must be understandable.
- Provider forms must show clear validation errors.
- Drafts must protect users from losing unfinished work.
- Pricing fields must explain their meaning.
- Submission and review states must be clear.
- Providers must understand that registration is not verification.

### 10.4 Accessibility

- Images must require meaningful alternative text.
- Forms must have labels and understandable instructions.
- Keyboard navigation must be supported.
- Colour contrast must remain readable.
- Interactive controls must have visible states.
- Status must not be communicated by colour alone.
- Reduced-motion preferences must be respected.

### 10.5 Reliability

- Errors must not crash the application.
- Failed media uploads must be retryable.
- Important multi-record operations should use transactions.
- Duplicate submissions should be detected or flagged.
- Provider enrolment must be safe to retry.
- Partial failures must not grant incorrect authorization.
- Rejected or abandoned remote media must be cleanable.

### 10.6 Scalability

- Pagination must be supported.
- Media must remain outside PostgreSQL.
- The architecture must remain modular.
- Provider roles must not require redesigning public access.
- Verification must remain separate from authorization.
- Publication must remain separate from submission.
- Storage-provider details must remain isolated behind media services.

### 10.7 Cost Control

- Free-plan usage must be monitored.
- Upload limits must be configurable.
- Cloudinary credits must be reviewed before expanding the pilot.
- No credit card or paid service may be enabled without explicit approval.
- The decision owner must be informed before any potentially chargeable change.

## 11. Business Rules

1. Anonymous users may browse eligible public properties.
2. Registration is optional for public browsing.
3. Administrator registration is prohibited.
4. Provider enrolment does not require manual role approval.
5. Provider role does not equal provider verification.
6. Every provider-owned property must reference the authenticated provider UUID.
7. A provider may manage only their own eligible records.
8. Verification status must not be inferred from publication status.
9. Provider submission must not automatically publish a property.
10. Only an administrator may verify or publish.
11. Only published and verified properties are publicly visible.
12. Exact addresses and coordinates are not anonymous public data.
13. Every mandatory fee must be disclosed separately.
14. Agent fees must be explicitly identified when agents are supported.
15. Approved public media must accurately represent the property.
16. Rejected media must not be returned by the public API.
17. Publication requires the documented completeness conditions.
18. Availability and verification information must record freshness.
19. Applied database migrations must not be rewritten.
20. Paid infrastructure requires explicit approval.

Physical properties, rentable units and time-bound listings remain conceptually
distinct. The exact introduction of a separate `listings` table must be decided
before provider write migrations depend on that distinction.

## 12. Success Criteria

The provider pilot is successful when:

- Visitors can browse public properties on mobile and desktop without signing in.
- Seekers can register without receiving provider permissions.
- Providers can register without waiting for manual role approval.
- Providers can access a protected workspace.
- Providers can create and submit only their own drafts.
- Providers can upload permitted property media securely.
- Provider A cannot access Provider B's private information.
- Providers cannot verify or publish their own submissions.
- Exact locations remain absent from public responses.
- The administrator can review and publish without editing source code.
- Published properties continue satisfying integrity rules.
- Automated tests prove the required role and ownership boundaries.
- The pilot remains within explicitly approved service limits.

## 13. Assumptions

- The first property inventory is around UNIMAID and Maiduguri.
- Prices are initially displayed primarily in Nigerian naira.
- Public catalogue access remains anonymous.
- Provider registration is self-service.
- Provider identity and listings begin unverified.
- Listing review is manual during the initial pilot.
- The existing administrator remains the only administrator.
- Initial administrator work may use the Supabase Dashboard.
- Cloudinary stores public property media.
- Payments remain postponed.
- Automated verification remains postponed.

## 14. Pending Decisions

- Final public brand name
- Exact launch-area boundaries
- Primary public authentication method
- Production authentication redirect URLs
- Exact provider identity-verification evidence
- Contact-information visibility
- Listing-expiration period
- Inquiry notification method
- Separate `listings` table timing
- Final provider form steps
- Cloudinary file-count and file-size limits
- Production frontend hosting
- Staging and production domain names
