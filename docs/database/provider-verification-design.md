# Provider Verification Database Design

## Implementation Phase

Phase 2 — Provider onboarding.

This module is designed now to prevent future architectural conflicts, but its tables, APIs and interface will not be implemented during the initial admin-managed MVP.

## Purpose

This module verifies people who want to submit and manage properties.

Provider verification is separate from property verification:

- Provider verification confirms who the person or organisation is.
- Property verification checks whether they are authorised to list a particular property.
- A verified person does not automatically make every submitted property verified.

---

## 1. Provider Profiles Table

The `provider_profiles` table stores provider-specific information.

| Column              | Data type    | Rules                                 | Purpose                                 |
| ------------------- | ------------ | ------------------------------------- | --------------------------------------- |
| profile_id          | UUID         | Primary key, references `profiles.id` | Connects provider information to a user |
| business_name       | VARCHAR(150) | Optional                              | Trading or organisation name            |
| bio                 | TEXT         | Optional, length limited              | Public provider description             |
| verification_status | VARCHAR(20)  | Not null, default `draft`             | Provider verification state             |
| verified_at         | TIMESTAMPTZ  | Optional                              | Verification completion time            |
| verified_by         | UUID         | Optional, references `profiles.id`    | Administrator who approved verification |
| suspended_at        | TIMESTAMPTZ  | Optional                              | Provider suspension time                |
| suspension_reason   | TEXT         | Optional, private                     | Reason provider access was suspended    |
| created_at          | TIMESTAMPTZ  | Not null, default current time        | Creation time                           |
| updated_at          | TIMESTAMPTZ  | Not null, default current time        | Latest update                           |

### Verification Statuses

- `draft`
- `pending`
- `verified`
- `rejected`
- `suspended`

### Rules

- One user can have only one provider profile.
- A provider profile does not prove ownership of any property.
- `verified_at` and `verified_by` are required when status becomes `verified`.
- A suspension must include a reason.
- Provider status changes must be performed by authorised backend operations.
- Public users must not see private suspension or verification details.

---

## 2. Provider Verification Requests Table

The `provider_verification_requests` table records every verification attempt.

| Column              | Data type   | Rules                                               | Purpose                         |
| ------------------- | ----------- | --------------------------------------------------- | ------------------------------- |
| id                  | UUID        | Primary key                                         | Verification request identifier |
| provider_profile_id | UUID        | Not null, references `provider_profiles.profile_id` | Provider being reviewed         |
| status              | VARCHAR(20) | Not null, default `draft`                           | Request status                  |
| submitted_at        | TIMESTAMPTZ | Optional                                            | Submission time                 |
| reviewed_at         | TIMESTAMPTZ | Optional                                            | Review completion time          |
| reviewed_by         | UUID        | Optional, references `profiles.id`                  | Administrator who reviewed it   |
| rejection_reason    | TEXT        | Optional, private                                   | Explanation when rejected       |
| created_at          | TIMESTAMPTZ | Not null, default current time                      | Creation time                   |
| updated_at          | TIMESTAMPTZ | Not null, default current time                      | Latest update                   |

### Request Statuses

- `draft`
- `submitted`
- `under_review`
- `approved`
- `rejected`
- `cancelled`

### Rules

- A provider may have several attempts over time.
- A provider may have only one active submitted or under-review request.
- Rejected requests must include a reason.
- Customers can view only their own requests.
- Reviewers access requests through authorised backend operations.

---

## 3. Verification Documents Table

The `verification_documents` table stores metadata for private evidence uploaded to Supabase Storage.

The actual files are not stored in PostgreSQL.

| Column                  | Data type    | Rules                                                    | Purpose                                                                  |
| ----------------------- | ------------ | -------------------------------------------------------- | ------------------------------------------------------------------------ |
| id                      | UUID         | Primary key                                              | Document identifier                                                      |
| verification_request_id | UUID         | Not null, references `provider_verification_requests.id` | Connected request                                                        |
| document_type           | VARCHAR(30)  | Not null                                                 | Evidence category                                                        |
| storage_bucket          | VARCHAR(100) | Not null                                                 | Private Supabase bucket                                                  |
| storage_path            | TEXT         | Not null, unique                                         | Private object path                                                      |
| display_filename        | TEXT         | Not null                                                 | Sanitised user-facing filename                                           |
| mime_type               | VARCHAR(100) | Not null                                                 | Validated file type                                                      |
| file_size_bytes         | BIGINT       | Not null, greater than `0`                               | Validated file size                                                      |
| file_fingerprint        | TEXT         | Optional                                                 | Backend-generated keyed fingerprint for duplicate and integrity checking |
| review_status           | VARCHAR(20)  | Not null, default `pending`                              | Document review result                                                   |
| rejection_reason        | TEXT         | Optional, private                                        | Reason document was rejected                                             |
| uploaded_at             | TIMESTAMPTZ  | Not null, default current time                           | Upload time                                                              |
| reviewed_at             | TIMESTAMPTZ  | Optional                                                 | Review time                                                              |
| reviewed_by             | UUID         | Optional, references `profiles.id`                       | Reviewer                                                                 |

### Initial Document Types

- `identity`
- `business_registration`
- `authorisation_letter`
- `other`

The exact documents required must receive legal and operational review before launch.

### Security Rules

- Documents must use a private Supabase Storage bucket.
- Public and ordinary authenticated users cannot retrieve them.
- Providers can access only documents belonging to their requests.
- Reviewers receive temporary authorised access.
- Storage paths must not contain email addresses or full names.
- File type must be validated from content, not filename alone.
- File-size and upload-rate limits are required.
- Documents must follow the account-erasure and retention policy.

---

## Role Assignment Workflow

A user begins with:

`property_seeker`

After successful verification, one backend transaction performs:

1. Mark provider profile as `verified`.
2. Record reviewer and verification time.
3. Add `property_provider` to `user_roles`.
4. Write an audit event.

If provider activity is suspended:

- Keep historical role records.
- Mark provider status as `suspended`.
- Backend and RLS policies reject provider operations.
- The user may retain property-seeker access unless the whole account is suspended.

---

## Provider Type Decision

`landlord`, `caretaker` and `agent` do not belong in `provider_profiles`.

A person may be:

- Landlord for Property A
- Caretaker for Property B
- Agent for Property C

Their relationship must therefore be stored per property in a future `property_provider_assignments` table.

---

## Relationships

- One profile may have one provider profile.
- One provider profile may have many verification attempts.
- One verification request may have many private documents.
- One administrator may review many requests and documents.

## Implementation Phase

Phase 2 — Provider onboarding.

This module is designed now to prevent future architectural conflicts, but its tables, APIs and interface will not be implemented during the initial admin-managed MVP.
