# Product Requirements Document

## 1. Product Name

Real Estate Platform

## 2. Product Vision

Create a transparent real-estate marketplace where property seekers can inspect verified properties, understand the complete cost and contact landlords, caretakers or transparent agents directly.

## 3. Initial Market

The first release will focus on properties around UNIMAID and Maiduguri.

The platform will be accessible globally, allowing people outside Nigeria to inspect properties for themselves or another person.

## 4. Problem Statement

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

## 5. Product Goals

The platform will:

1. Make property information easy to inspect remotely.
2. Display rent and additional fees separately.
3. Calculate the total move-in cost.
4. Identify whether the provider is a landlord, caretaker or agent.
5. Prioritize direct and transparent communication.
6. Provide accurate location information.
7. Show listing verification and freshness information.
8. Allow visitors to report misleading information.
9. Provide a foundation for future provider onboarding.
10. Maintain data consistency and security as usage increases.

## 6. Phase 1 MVP Scope

### Included

- Public homepage
- Property catalogue
- Property search
- Property filters
- Property details
- Property photos and videos
- Property location
- Distance information
- Amenities
- Rent amount
- Additional fee breakdown
- Total move-in cost
- Provider-type disclosure
- Inquiry form
- Provider contact options
- Inaccurate-listing reports
- Administrator listing management
- Administrator verification workflow
- Publication and archival controls

### Excluded

- Public landlord registration
- Public caretaker registration
- Public agent registration
- Provider dashboards
- Online booking
- Online payment
- Refunds
- Provider payouts
- Property reviews
- Native mobile applications
- Multiple administrator roles
- Automated listing approval

## 7. User Roles

### 7.1 Visitor

A visitor can:

- Browse published listings
- Search for properties
- Apply property filters
- View property details
- View media
- View location information
- View rent and additional fees
- Contact the responsible provider
- Report an inaccurate listing

A visitor cannot:

- Create listings
- Edit listings
- Verify properties
- Access administrator pages

### 7.2 Administrator

An administrator can:

- Log in securely
- Create and edit properties
- Create property units
- Create and edit listings
- Add rent and additional fees
- Upload property media
- Add and confirm map locations
- Add provider contact information
- Record verification information
- Publish, unpublish and archive listings
- Review inquiries
- Review listing reports

## 8. Future Provider Roles

The database and authorization design should later support:

- Landlord
- Caretaker
- Agent
- Listing administrator
- Super administrator

Agents will be permitted only when their role and fees are clearly disclosed.

## 9. Functional Requirements

### FR-001: View Published Listings

The system shall display only published and active property listings to visitors.

### FR-002: Search Properties

The system shall allow visitors to search by property title, location and landmark.

### FR-003: Filter Properties

The system shall allow visitors to filter by:

- Property type
- Location
- Minimum and maximum price
- Rent period
- Number of bedrooms
- Furnishing status
- Amenities
- Provider type
- Availability

### FR-004: View Property Details

The system shall display:

- Property title
- Description
- Property type
- Address
- Landmark
- Map location
- Photos and videos
- Amenities
- Property rules
- Availability
- Verification information

### FR-005: Display Transparent Pricing

The system shall display:

- Rent amount
- Rent period
- Mandatory fees
- Optional fees
- Refundable fees
- Agent fee
- Total move-in cost

### FR-006: Identify the Provider

The system shall identify the provider as:

- Landlord
- Caretaker
- Agent

### FR-007: Submit Inquiry

The system shall allow a visitor to send an inquiry about a listing.

### FR-008: Contact Provider

The system shall provide approved contact options such as phone, email or WhatsApp.

### FR-009: Report Listing

The system shall allow visitors to report:

- Incorrect price
- Incorrect location
- Fake media
- Unavailable property
- Hidden fees
- Suspicious provider
- Other misleading information

### FR-010: Manage Properties

The administrator shall be able to create, update and archive properties.

### FR-011: Manage Listings

The administrator shall be able to create, update, publish, unpublish and archive listings.

### FR-012: Manage Media

The administrator shall be able to upload, categorize, reorder and remove property media.

### FR-013: Manage Fees

The administrator shall be able to create and update individual listing fees.

### FR-014: Verify Listings

The administrator shall be able to record:

- Physical inspection
- Location confirmation
- Price confirmation
- Availability confirmation
- Media review

## 10. Non-Functional Requirements

### 10.1 Security

- Secrets must not be committed to Git.
- Authentication must be verified by the backend.
- Administrator routes must require authorization.
- All inputs must be validated.
- Database Row-Level Security must be enabled where appropriate.
- Database constraints must protect data integrity.
- Important administrator actions should be audited.

### 10.2 Performance

- Public pages should load quickly.
- Media should be optimized for mobile connections.
- Listings should use pagination.
- Frequently queried columns should be indexed.
- Map-distance results should be stored after calculation.
- Database queries should return only required fields.

### 10.3 Usability

- The interface must be mobile-first.
- Navigation must be clear.
- Forms must show understandable errors.
- Pricing must be easy to understand.
- Important verification information must be visible.

### 10.4 Accessibility

- Images must have alternative text.
- Forms must have labels.
- Keyboard navigation must be supported.
- Colour contrast must remain readable.
- Interactive controls must have clear states.

### 10.5 Reliability

- Errors must not crash the application.
- Failed media uploads must be retryable.
- Listing information must not be partially saved.
- Important operations should use database transactions.
- Duplicate listings should be detected or flagged.

### 10.6 Scalability

- Property and listing records must remain separate.
- Pagination must be supported.
- Media must be stored outside PostgreSQL.
- The architecture must remain modular.
- Future provider roles must not require redesigning the core property model.

## 11. Business Rules

1. A property and a listing are different records.
2. A property can have multiple units.
3. A unit can have different listings over time.
4. Every listing must have one provider type.
5. Every mandatory fee must be displayed.
6. Agent fees must be explicitly identified.
7. Total move-in cost must include all mandatory fees.
8. Only published listings are publicly visible.
9. Archived listings remain available for historical records.
10. Verification status must not be inferred from publication status.
11. A listing can be published only after required information is complete.
12. Availability and verification must include their last-updated dates.

## 12. Success Criteria

Phase 1 is successful when:

- Visitors can browse and inspect properties on mobile and desktop.
- Visitors can understand the complete move-in cost.
- Visitors can identify who listed the property.
- Visitors can view accurate location information.
- Visitors can contact the responsible provider.
- Visitors can report misleading listings.
- The administrator can manage listings without editing source code.
- Unauthorized users cannot access administrator functions.

## 13. Assumptions

- Phase 1 listings are entered by the platform administrator.
- The first property inventory is located around UNIMAID/Maiduguri.
- Prices are initially displayed in Nigerian naira.
- Provider onboarding is postponed until Phase 2.
- Payments are postponed until their business rules are approved.

## 14. Pending Decisions

- Final public brand name
- Exact launch-area boundaries
- Contact information visibility
- Required verification evidence
- Listing-expiration period
- Inquiry notification method
- Provider identity-verification process
- Platform revenue model
