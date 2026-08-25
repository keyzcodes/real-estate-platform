# ADR-004: Media Storage and Virtual Tours

## Status

Accepted for MVP development

## Date

2026-08-25

## Decision Summary

- Cloudinary will store and deliver public property photos, videos and 360° panoramas.
- Supabase Storage will hold private verification documents.
- PostgreSQL will store media metadata, ownership and review status.
- Pannellum will display interactive 360° panorama scenes.
- Express will authorise and sign uploads.
- Browsers will upload files directly to Cloudinary.
- Media must be reviewed before public display.

## Context

Property media is central to the platform’s transparency goal. Visitors should understand the interior, exterior and surrounding area without physically visiting first.

Photos, videos and 360° panoramas require more storage, bandwidth and processing than normal database records. They should not pass through the Express server or be stored directly inside PostgreSQL.

## Media Responsibilities

| Media type                     | Storage/delivery |
| ------------------------------ | ---------------- |
| Public property photos         | Cloudinary       |
| Public property videos         | Cloudinary       |
| Public 360° panoramas          | Cloudinary       |
| Private verification documents | Supabase Storage |
| Media metadata                 | PostgreSQL       |
| Interactive panorama display   | Pannellum        |

## Upload Workflow

1. An authenticated provider selects a property.
2. Express verifies the provider’s role and property access.
3. Express checks upload type, limits and quota.
4. Express generates a short-lived signed upload.
5. The browser uploads directly to Cloudinary.
6. PostgreSQL records the returned storage identifier and metadata.
7. The media enters `pending` status.
8. An authorised reviewer approves or rejects it.
9. Only approved media becomes publicly visible.

## Reasons

- Direct browser uploads prevent large files from consuming Express memory.
- Cloudinary provides optimisation, transformations and CDN delivery.
- Supabase Storage policies protect private verification documents.
- PostgreSQL remains focused on structured data.
- Pannellum provides 360° viewing without licence cost.
- Storage providers can be changed because database records use provider-neutral identifiers.

## MVP Upload Limits

Initial configurable limits:

- 15–20 photos per property
- 1–2 videos per property
- 5–8 panorama scenes per virtual tour
- Video resolution up to 1080p
- Video duration around 60–90 seconds
- Approved file types only
- File-size limits defined before implementation

These are application limits and can change without rebuilding the database.

## Performance Rules

- Generate thumbnails for listing cards.
- Use responsive image sizes.
- Lazy-load media below the visible screen.
- Do not preload videos.
- Load video only after user interaction.
- Optimise images into modern formats where supported.
- Paginate large galleries.
- Use poster images for video previews.
- Load a lower-resolution panorama before full detail where possible.

## Security Rules

- Cloudinary API secrets remain on the backend.
- React must never contain Cloudinary secret credentials.
- Upload signatures must expire quickly.
- File extension alone must not determine file type.
- Validate MIME type and actual file content.
- Random provider-generated storage identifiers must be used.
- Providers can upload only to properties they are authorised to manage.
- Rate limits and quotas must prevent upload abuse.
- Rejected media must not be publicly retrievable through the platform.
- Private documents must use private buckets and authorised access.
- Media deletion must remove both the database record and stored asset.

## Transparency and Privacy Rules

- Media must accurately represent the property.
- Capture and verification dates should be recorded.
- Important media replacements require review.
- Faces and vehicle registration plates should be blurred where necessary.
- Providers must have permission to record private interiors.
- Neighbourhood media must avoid exposing private residents.
- Visitors must be able to report misleading or outdated media.
- Verification badges must describe what was actually checked.

## Virtual Tour Structure

A virtual tour contains multiple connected scenes:

`virtual_tours → tour_scenes → tour_hotspots`

Example:

`Exterior → Entrance → Bedroom → Bathroom → Kitchen`

Each hotspot identifies the scene that should open when selected.

## Alternatives Considered

### Store Everything in Supabase Storage

Not selected for public media because the MVP benefits from automatic image optimisation, video transcoding and specialised CDN delivery.

### Store Files in PostgreSQL

Rejected because large binary files would increase database size, backups and query costs.

### Pass Uploads Through Express

Rejected because it would consume backend memory, CPU and bandwidth unnecessarily.

### 360° Video Only

Rejected for the MVP because it requires substantially more bandwidth than panoramic images.

## Free-Tier Risks

- Cloudinary’s free credits include storage, transformations and bandwidth.
- Videos may consume the allowance quickly.
- Excessive transformations can exhaust credits.
- Provider limits can change.
- A usage dashboard and alerts must be reviewed regularly.

## Upgrade Triggers

Review or upgrade the media service when:

- Usage reaches 70–80% of available credits.
- Videos buffer or fail because of delivery limits.
- Property count makes the upload limits impractical.
- More advanced moderation or transformation is required.
- Revenue supports predictable media infrastructure costs.
- Provider pricing or terms change.

## Consequences

### Positive

- Fast global media delivery
- Reduced backend workload
- Optimised images and videos
- Interactive 360° transparency
- Clear separation of public and private files

### Negative

- Another external provider must be managed.
- Free credits restrict the number of media files.
- Deleting accounts and properties must also delete remote assets.
- Media-provider outages may affect listing galleries.

## Review Schedule

Review this decision:

- Before enabling provider uploads
- Before launching 360° tours
- Before public commercial launch
- When media usage reaches 70% of the free allowance
