# Authentication and Provider Access API

## Project

Real Estate Platform

## Status

Implemented and verified on the `feature/self-service-provider-authentication`
branch.

The authentication flow is covered by frontend, backend and database-security
tests. A controlled local Google OAuth journey has also been completed
successfully.

Google OAuth remains in Testing mode and is not configured for unrestricted
production access.

## Purpose

This document defines the authenticated API used to:

- Read the signed-in account
- Enrol the signed-in account as a property provider
- Enter the protected provider workspace
- Return controlled authentication and authorization errors
- Protect account endpoints with scoped rate limits

This document describes the implemented API contract. Architectural reasoning
and future provider capabilities remain documented in ADR-010.

## Base URL

```text
/api/v1

For local development, the default backend origin is:

http://localhost:5000

Therefore, the complete local API base URL is:

http://localhost:5000/api/v1
Authentication Method

Protected requests must include a valid Supabase access token:

Authorization: Bearer <supabase-access-token>

The browser obtains this token from the authenticated Supabase session.

The frontend must never:

Log the access token
Include the token in a URL
Store a service-role key
Send an arbitrary user UUID as proof of identity
Send an arbitrary role for authorization
Treat editable user metadata as an authorization source
Authentication Flow

For each protected request, Express:

Reads the Authorization header.
Requires the Bearer authentication scheme.
Validates the access token through Supabase Auth.
Reads the authenticated UUID from the validated token subject.
Validates that the subject is a UUID.
Creates a request-scoped Supabase client.
Adds the user’s bearer token to that client.
Loads the matching profile and database roles.
Confirms that the profile has active account status.
Applies any endpoint-specific role requirement.
Allows PostgreSQL permissions and Row Level Security to remain active.

The backend uses the Supabase publishable key for these operations.

A Supabase service-role key is not used for ordinary authenticated requests.

Standard Success Response

Successful responses use this envelope:

{
  "success": true,
  "data": {}
}
Standard Error Response

Controlled errors use this envelope:

{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "A safe error message."
  }
}

Internal database errors, access tokens, environment variables, stack traces and
provider-internal diagnostics must never be returned to the client.

Rate Limits

Rate limits use the request IP address and independent scoped counters.

Scope	Limit	Window
All /api/v1 routes	300 requests	15 minutes
/api/v1/auth routes	60 requests	15 minutes
/api/v1/provider routes	60 requests	15 minutes
Provider-enrolment route	10 requests	15 minutes

Applicable rate limits are cumulative.

For example, provider enrolment is protected by:

The general API limiter
The account API limiter
The provider-enrolment limiter

The most restrictive applicable limit may reject the request first.

Account-specific rate-limit responses use:

{
  "success": false,
  "error": {
    "code": "ACCOUNT_RATE_LIMIT_EXCEEDED",
    "message": "Too many account requests. Please try again later."
  }
}

The account-specific rate-limit status is:

429 Too Many Requests

Standard rate-limit response headers are enabled. Legacy rate-limit headers are
disabled.

1. Get Current Account
Endpoint
GET /api/v1/auth/me
Purpose

Returns the active profile and authoritative database roles belonging to the
validated authenticated UUID.

Authentication

Required.

Required Header
Authorization: Bearer <supabase-access-token>
Request Body

None.

Successful Response

Status:

200 OK

Example:

{
  "success": true,
  "data": {
    "account": {
      "id": "94000000-0000-4000-8000-000000000001",
      "fullName": "Example User",
      "avatarUrl": null,
      "accountStatus": "active",
      "roles": [
        "property_provider",
        "property_seeker"
      ]
    }
  }
}

The roles array is sorted before it is returned.

Possible roles currently recognized by the backend are:

property_seeker
property_provider
admin

The presence of a role in this response does not replace endpoint-specific
authorization checks.

Possible Errors
401 AUTHENTICATION_REQUIRED
403 ACCOUNT_ACCESS_DENIED
429 ACCOUNT_RATE_LIMIT_EXCEEDED
500 INTERNAL_SERVER_ERROR
2. Enrol Current User as Provider
Endpoint
POST /api/v1/auth/provider-enrolment
Purpose

Adds the property_provider role to the currently authenticated account.

Authentication

Required.

Required Header
Authorization: Bearer <supabase-access-token>
Request Body

None.

The endpoint does not use a client-supplied:

User UUID
Profile ID
Role
Account status

Identity comes exclusively from the validated access token.

The role added by this operation is fixed as:

property_provider
Successful Response

Status:

200 OK

Example for a newly created provider role:

{
  "success": true,
  "data": {
    "providerEnrolment": {
      "created": true,
      "role": "property_provider",
      "roles": [
        "property_provider",
        "property_seeker"
      ]
    }
  }
}

Example result when the account already has the provider role:

{
  "success": true,
  "data": {
    "providerEnrolment": {
      "created": false,
      "role": "property_provider",
      "roles": [
        "property_provider",
        "property_seeker"
      ]
    }
  }
}
Retry Safety

Provider enrolment is idempotent for the authenticated account.

In plain language, repeating the request does not create duplicate provider
roles:

created: true means the role was added by this request.
created: false means the role already existed.
Database Operation

The backend calls:

public.enrol_current_user_as_provider()

The database function:

Accepts no UUID argument
Accepts no role argument
Uses the authenticated database identity
Adds only property_provider
Rejects unauthenticated callers
Rejects missing profiles
Rejects every profile whose account status is not active
Prevents duplicate role records
Is executable by authenticated users only
Possible Errors
401 AUTHENTICATION_REQUIRED
403 ACCOUNT_ACCESS_DENIED
429 ACCOUNT_RATE_LIMIT_EXCEEDED
500 INTERNAL_SERVER_ERROR
3. Get Provider Workspace
Endpoint
GET /api/v1/provider/workspace
Purpose

Returns the identity information required to render the protected provider
workspace.

This endpoint is the current provider-workspace foundation. Property draft and
submission endpoints have not yet been implemented.

Authentication

Required.

Authorization

The active account must have the authoritative database role:

property_provider
Required Header
Authorization: Bearer <supabase-access-token>
Request Body

None.

Successful Response

Status:

200 OK

Example:

{
  "success": true,
  "data": {
    "workspace": {
      "providerId": "94000000-0000-4000-8000-000000000001",
      "fullName": "Example Provider",
      "avatarUrl": null
    }
  }
}

The providerId is derived from the active profile associated with the
validated access token. It is not accepted from the request.

Possible Errors
401 AUTHENTICATION_REQUIRED
403 ACCOUNT_ACCESS_DENIED
403 PROVIDER_ACCESS_REQUIRED
429 ACCOUNT_RATE_LIMIT_EXCEEDED
500 INTERNAL_SERVER_ERROR
Controlled Authentication Errors
Authentication Required

Status:

401 Unauthorized

Response:

{
  "success": false,
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "A valid bearer access token is required."
  }
}

This response covers:

Missing authorization header
Malformed bearer header
Empty bearer token
Invalid access token
Expired access token
Token without a valid UUID subject
Account Access Denied

Status:

403 Forbidden

Response:

{
  "success": false,
  "error": {
    "code": "ACCOUNT_ACCESS_DENIED",
    "message": "This account cannot access protected resources."
  }
}

This response covers an authenticated identity that does not resolve to an
active platform profile.

It deliberately does not disclose whether the profile is:

Missing
Suspended
Otherwise inactive
Provider Access Required

Status:

403 Forbidden

Response:

{
  "success": false,
  "error": {
    "code": "PROVIDER_ACCESS_REQUIRED",
    "message": "An active property-provider account is required."
  }
}

This response applies when an active account does not have the authoritative
property_provider database role.

Internal Server Error

Status:

500 Internal Server Error

Response:

{
  "success": false,
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "The server could not complete the request."
  }
}

The API logs the internal failure on the backend but returns only the controlled
message to the client.

Authorization Sources

The API authorizes protected requests using:

The validated Supabase token subject
The matching active profile
Roles read from the database
PostgreSQL permissions
Row Level Security policies

The API does not authorize requests using:

A UUID supplied in a request body
A role supplied by the frontend
Client-editable authentication metadata
A hidden frontend route
Frontend conditional rendering
A claimed provider ID
A Google email address by itself
Provider Role and Verification

The property_provider role allows access to provider functionality.

It does not mean that:

The provider has been identity-verified
A property has been verified
Property media has been approved
A listing may be published
A verified-provider badge may be displayed

Provider authorization, provider verification, property verification and
publication remain separate controls.

Local OAuth Configuration

The verified local frontend origin is:

http://localhost:5173

The frontend callback route is:

http://localhost:5173/auth/callback

The verified Supabase Auth settings are:

Site URL: http://localhost:5173
Redirect URL: http://localhost:5173/auth/callback

The Google OAuth client uses:

Authorized JavaScript origin:
http://localhost:5173

The Google authorized redirect URI follows this format:

https://<supabase-project-ref>.supabase.co/auth/v1/callback

The actual project reference, OAuth client secret and test-user email addresses
must not be committed to this document.

Vite uses port 5173 with strict-port enforcement so the development server
does not silently move to an unapproved OAuth origin.

Google OAuth Data Boundary

The application currently requests only the identity scopes required for
sign-in:

openid
Email address
Basic profile information

Google handles the Google account password. The application does not receive or
store that password.

After Google confirms the identity, Supabase creates the authenticated session.
The platform then applies its own profile, account-status, role and workspace
rules.

Current Environment Boundary

Google OAuth is currently configured as:

Audience: External
Publishing status: Testing

Only approved Google test users can complete the OAuth flow while the client
remains in Testing mode.

Production deployment will require a separate review of:

Production frontend origin
Production callback URL
Supabase Site URL
Supabase redirect allow-list
Google OAuth authorized origins
Google OAuth authorized redirect URIs
OAuth consent-screen publishing requirements

No production URL should be added until the hosting destination is selected and
reviewed.

Current Non-Goals

The current authenticated API does not yet provide:

Provider property-draft creation
Provider property editing
Listing submission
Administrator review endpoints
Listing publication endpoints
Cloudinary upload signatures
Media approval
Exact-location disclosure
Booking
Payments

These capabilities require separate authorization, ownership and security
reviews.

Verification Coverage

The implemented authentication boundary is covered by:

Frontend component integration tests
Frontend session-lifecycle tests
Backend unit tests
Backend API integration tests
Provider-role authorization tests
Authentication rate-limit tests
pgTAP provider-enrolment tests
Row Level Security tests
Public catalogue regression tests
Controlled local end-to-end verification

The public catalogue remains accessible without authentication.
```
