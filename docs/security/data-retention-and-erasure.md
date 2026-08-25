# Data Retention and Erasure Policy

## Status

Draft for MVP development and legal review

## Date

2026-08-25

## Purpose

This document defines how the Real Estate Platform deletes, anonymises, retains and restores personal data.

It is an engineering policy and must receive appropriate legal and data-protection review before commercial launch.

## Principles

- Collect only information required for a defined purpose.
- Do not retain personal data indefinitely.
- Allow users to request account deletion.
- Remove data from all relevant systems.
- Keep backups encrypted and inaccessible for normal operations.
- Never restore deleted user data into production.
- Retain information only where a documented legal or operational basis exists.
- Clearly explain retention practices in the public privacy notice.

## Systems Containing User Data

- Supabase Auth
- PostgreSQL tables
- Supabase Storage
- Cloudinary
- Express application logs
- Email and notification providers
- Analytics services
- Future payment providers
- Manual database backups
- External erasure ledger

## Account Deletion Workflow

1. The user selects **Delete account**.
2. The interface clearly explains the consequences.
3. The user confirms the permanent action.
4. The backend requires recent authentication.
5. The system checks for unresolved bookings, disputes or legal restrictions.
6. New account activity is blocked.
7. Personal records are deleted or anonymised.
8. Supabase Auth credentials are deleted.
9. Uploaded personal media and documents are removed.
10. Third-party deletion requests are submitted.
11. Completion is verified.
12. A minimal erasure receipt is recorded.
13. The user receives confirmation.

## User Confirmation Message

> Are you sure you want to delete your account? Your profile and personal information will be permanently removed. Some records may be retained only where required for legal, accounting, fraud-prevention or dispute purposes. This action cannot be undone.

## Deletion Behaviour

### Delete

Delete information that is no longer required:

- Authentication credentials
- Profile name and contact information
- Avatar
- Open inquiries where retention is unnecessary
- Unnecessary occupant information
- Private verification documents
- User-owned media where no valid listing reason remains
- Sessions and refresh tokens

### Anonymise

Historical records may remain without directly identifying the person:

- Completed booking references
- Aggregated ratings
- Financial totals
- System performance statistics

Anonymised information must not reasonably allow the person to be identified again.

### Restricted Retention

Some information may be retained where required for:

- Accounting or tax obligations
- Active disputes
- Fraud investigations
- Legal claims
- Regulatory requirements

Retained data must be minimised, access-restricted and deleted when the retention reason expires.

## Backup Policy

- Manual backups must be encrypted.
- Backup access must be restricted.
- MVP manual backups should not be retained beyond 30 days unless a documented reason exists.
- Expired backups must be securely destroyed.
- Backups must not be used for analytics or normal application access.
- The privacy notice must explain backup retention.
- Backup retention must be reviewed before commercial launch.

## Erasure Ledger

A minimal erasure ledger must be stored separately from normal application backups.

It should contain only what is necessary to prevent deleted users from being restored:

- Erasure request identifier
- Protected or hashed subject identifier
- Request date
- Completion date
- Systems affected
- Verification result

It must not contain a copy of the deleted profile.

## Backup Restoration Procedure

A backup must never be restored directly into public production.

Required procedure:

1. Restore into an isolated environment.
2. Keep all public API access disabled.
3. Retrieve erasure records newer than the backup.
4. Reapply every relevant deletion and anonymisation.
5. Remove expired or unnecessary information.
6. verify database, storage and authentication state.
7. Record the restoration audit.
8. Enable production traffic only after approval.

## Third-Party Deletion

The erasure process must cover all processors holding user data:

- Supabase
- Cloudinary
- Northflank
- Cloudflare
- Email provider
- Analytics provider
- Payment provider

A database deletion is not complete if another service still retains an unnecessary identifiable copy.

## Failure Handling

If part of the deletion fails:

- Keep the account blocked.
- Record the failed system and reason.
- Retry safely.
- Alert an administrator.
- Do not report completion until required deletion steps succeed.
- Provide truthful status information to the user.

## Audit Requirements

Record:

- Who requested deletion
- When identity was verified
- Which systems were processed
- Which records were deleted or anonymised
- Any lawful retention reason
- Completion or failure status

Audit records must not recreate the deleted personal profile.

## Free-Tier Considerations

- Free services may provide limited backup, audit and log controls.
- Manual backups require our own secure retention process.
- Provider deletion capabilities must be tested before launch.
- Upgrade may be required when legal, backup or audit requirements exceed free-plan features.

## Pre-Launch Requirements

Before accepting real users:

- Implement and test account deletion.
- Test media and document deletion.
- Test failed deletion retries.
- Test restoration with erasure replay.
- Publish a privacy notice.
- Define final retention periods.
- Review processor agreements and privacy terms.
- Obtain appropriate Nigerian data-protection and legal review.
