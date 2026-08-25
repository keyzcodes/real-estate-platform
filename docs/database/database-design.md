# Database Design

## Project

Real Estate Platform

## Database

PostgreSQL through Supabase.

## Design Principles

- Use UUIDs for primary keys.
- Enforce security at the frontend, backend and database levels.
- Store authentication credentials only in Supabase Auth.
- Use database constraints to prevent invalid data.
- Record creation and update timestamps.
- Design the MVP so it can expand later.

---

## 1. Profiles Table

The `profiles` table stores public application information for authenticated users.

Authentication details such as passwords are managed by Supabase Auth and must not be stored here.

| Column         | Data type    | Rules                                   | Purpose                                  |
| -------------- | ------------ | --------------------------------------- | ---------------------------------------- |
| id             | UUID         | Primary key, references `auth.users.id` | Connects the profile to a Supabase user  |
| full_name      | VARCHAR(100) | Not null                                | User’s display name                      |
| phone_number   | VARCHAR(20)  | Optional, unique when provided          | Contact information                      |
| avatar_url     | TEXT         | Optional                                | Profile image location                   |
| role           | VARCHAR(20)  | Not null, default `customer`            | Controls user permissions                |
| account_status | VARCHAR(20)  | Not null, default `active`              | Controls whether the account can operate |
| created_at     | TIMESTAMPTZ  | Not null, default current time          | Records profile creation                 |
| updated_at     | TIMESTAMPTZ  | Not null, default current time          | Records the latest update                |

### Allowed Roles

For the MVP:

- `customer` — browses properties and makes bookings.
- `admin` — manages listings, users and platform operations.

Future roles:

- `landlord`
- `caretaker`
- `agent`

These future roles should not be activated until their workflows and verification rules are designed.

### Allowed Account Statuses

- `active`
- `suspended`
- `pending_verification`

### Relationship

Each Supabase Auth user has at most one profile:

`auth.users (1) -> (0..1) profiles`

### Security Decisions

- Passwords never enter the `profiles` table.
- A customer can read and update only their own protected profile information.
- An admin can view and manage profiles through authorised backend operations.
- A user cannot change their own role or account status.
- Role checks must also be enforced by Supabase Row Level Security.

---

## 2. Properties Table

The `properties` table stores general information about a building or real-estate listing. Prices and availability belong to individual property units.

| Column              | Data type    | Rules                              | Purpose                                |
| ------------------- | ------------ | ---------------------------------- | -------------------------------------- |
| id                  | UUID         | Primary key                        | Unique property identifier             |
| created_by          | UUID         | Not null, references `profiles.id` | User who created the listing           |
| title               | VARCHAR(150) | Not null                           | Public listing title                   |
| description         | TEXT         | Not null                           | Detailed property description          |
| property_type       | VARCHAR(30)  | Not null                           | Category of property                   |
| country             | VARCHAR(100) | Not null, default `Nigeria`        | Property country                       |
| state               | VARCHAR(100) | Not null                           | State or region                        |
| city                | VARCHAR(100) | Not null                           | City                                   |
| area                | VARCHAR(150) | Not null                           | Neighbourhood or local area            |
| street_address      | TEXT         | Not null                           | Full internal address                  |
| latitude            | DECIMAL(9,6) | Optional                           | GPS latitude                           |
| longitude           | DECIMAL(9,6) | Optional                           | GPS longitude                          |
| location_visibility | VARCHAR(20)  | Not null, default `approximate`    | Controls public location accuracy      |
| verification_status | VARCHAR(20)  | Not null, default `pending`        | Records listing verification           |
| publication_status  | VARCHAR(20)  | Not null, default `draft`          | Controls whether the listing is public |
| created_at          | TIMESTAMPTZ  | Not null, default current time     | Records creation time                  |
| updated_at          | TIMESTAMPTZ  | Not null, default current time     | Records latest update                  |

### Allowed Property Types

- `hostel`
- `house`
- `apartment`
- `self_contained`
- `room`

### Allowed Verification Statuses

- `pending`
- `verified`
- `rejected`

### Allowed Publication Statuses

- `draft`
- `published`
- `unpublished`
- `archived`

### Location Rules

- Latitude must be between `-90` and `90`.
- Longitude must be between `-180` and `180`.
- Latitude and longitude must either both be provided or both be absent.
- The exact street address must not automatically be exposed publicly.
- Public users may initially see an approximate map location for safety.
- Exact-location access rules will be defined with the viewing and booking workflow.

### Publishing Rule

A property can be publicly visible only when:

- `verification_status = verified`
- `publication_status = published`

### MVP Ownership Decision

During the first phase, only administrators can create and publish properties.

The `created_by` relationship is retained so the platform can later support verified landlords, caretakers and transparent agents without redesigning the property table.

### Relationships

- One profile can create many properties.
- One property is created by one profile.

## `profiles (1) -> (many) properties`

## 3. Property Units Table

The `property_units` table represents the individual spaces available for rent inside a property.

A property must have at least one unit before users can book it.

| Column              | Data type     | Rules                                | Purpose                           |
| ------------------- | ------------- | ------------------------------------ | --------------------------------- |
| id                  | UUID          | Primary key                          | Unique unit identifier            |
| property_id         | UUID          | Not null, references `properties.id` | Connects the unit to its property |
| unit_name           | VARCHAR(100)  | Not null                             | Identifies the room or apartment  |
| unit_type           | VARCHAR(30)   | Not null                             | Describes the kind of unit        |
| description         | TEXT          | Optional                             | Unit-specific information         |
| bedrooms            | SMALLINT      | Not null, minimum `0`                | Number of bedrooms                |
| bathrooms           | SMALLINT      | Not null, minimum `0`                | Number of bathrooms               |
| maximum_occupants   | SMALLINT      | Not null, minimum `1`                | Maximum number of residents       |
| base_rent           | NUMERIC(12,2) | Not null, greater than `0`           | Rent before additional charges    |
| currency            | CHAR(3)       | Not null, default `NGN`              | ISO currency code                 |
| billing_period      | VARCHAR(20)   | Not null                             | How often rent is charged         |
| availability_status | VARCHAR(20)   | Not null, default `available`        | Current rental availability       |
| available_from      | DATE          | Optional                             | Earliest move-in date             |
| created_at          | TIMESTAMPTZ   | Not null, default current time       | Records creation time             |
| updated_at          | TIMESTAMPTZ   | Not null, default current time       | Records latest update             |

### Allowed Unit Types

- `single_room`
- `self_contained`
- `studio`
- `one_bedroom`
- `two_bedroom`
- `three_bedroom`
- `entire_house`

### Allowed Billing Periods

- `monthly`
- `quarterly`
- `yearly`

For the initial hostel market, most units will use `yearly`. Supporting other periods prevents a future database redesign.

### Allowed Availability Statuses

- `available`
- `reserved`
- `occupied`
- `unavailable`

### Financial Rules

- Monetary values use `NUMERIC`, not floating-point types.
- `base_rent` must be greater than zero.
- The currency uses a three-letter ISO code such as `NGN`, `USD` or `GBP`.
- Additional charges must not be hidden inside `base_rent`.
- Agent, caution, service and other fees will be stored separately for transparent cost breakdowns.

### Relationships

- One property can contain many units.
- Each unit belongs to exactly one property.

## `properties (1) -> (many) property_units`

## 4. Unit Fees Table

The `unit_fees` table stores every additional charge separately from the base rent. This supports transparent pricing and prevents hidden agent or service fees.

| Column            | Data type     | Rules                                    | Purpose                          |
| ----------------- | ------------- | ---------------------------------------- | -------------------------------- |
| id                | UUID          | Primary key                              | Unique fee identifier            |
| unit_id           | UUID          | Not null, references `property_units.id` | Connects the fee to a unit       |
| fee_type          | VARCHAR(30)   | Not null                                 | Category of charge               |
| fee_name          | VARCHAR(100)  | Not null                                 | Public name of the charge        |
| description       | TEXT          | Optional                                 | Explains why the fee is required |
| amount            | NUMERIC(12,2) | Not null, minimum `0`                    | Exact fee amount                 |
| currency          | CHAR(3)       | Not null, default `NGN`                  | ISO currency code                |
| payment_frequency | VARCHAR(20)   | Not null, default `one_time`             | How often the fee is paid        |
| is_mandatory      | BOOLEAN       | Not null, default `true`                 | Whether the customer must pay it |
| is_refundable     | BOOLEAN       | Not null, default `false`                | Whether it can be returned       |
| created_at        | TIMESTAMPTZ   | Not null, default current time           | Records creation time            |
| updated_at        | TIMESTAMPTZ   | Not null, default current time           | Records latest update            |

### Allowed Fee Types

- `caution`
- `service`
- `maintenance`
- `legal`
- `agent`
- `application`
- `other`

### Allowed Payment Frequencies

- `one_time`
- `monthly`
- `quarterly`
- `yearly`

### Transparency Rules

- Every mandatory charge must be stored as a separate fee.
- A fee must have a clear public name.
- An `other` fee must include a description.
- Agent fees must be explicitly labelled as `agent`.
- A zero agent fee can be shown publicly as “No agent fee.”
- Fees cannot be added after payment without creating a new customer-approved payment request.
- The frontend must show the complete price breakdown before booking.

### Total Cost Rule

The displayed initial cost is calculated from:

`base rent + all mandatory fees due at the beginning`

The total should be calculated from its components rather than permanently stored in this table. This prevents the displayed total from becoming inconsistent when a fee changes.

### Relationships

- One unit can have zero or many fees.
- Each fee belongs to exactly one unit.

## `property_units (1) -> (many) unit_fees`

## 5. Property Media Table

The `property_media` table stores information about property photos and videos. The actual files will be stored in a media storage service, not inside PostgreSQL.

| Column              | Data type    | Rules                                | Purpose                               |
| ------------------- | ------------ | ------------------------------------ | ------------------------------------- |
| id                  | UUID         | Primary key                          | Unique media identifier               |
| property_id         | UUID         | Not null, references `properties.id` | Connects media to a property          |
| media_type          | VARCHAR(20)  | Not null                             | Identifies a photo or video           |
| storage_provider    | VARCHAR(30)  | Not null                             | Service storing the file              |
| storage_key         | TEXT         | Not null, unique                     | File identifier inside storage        |
| public_url          | TEXT         | Optional                             | Delivery URL when publicly accessible |
| alt_text            | VARCHAR(200) | Required for images                  | Accessibility description             |
| display_order       | SMALLINT     | Not null, default `0`                | Controls media arrangement            |
| is_cover            | BOOLEAN      | Not null, default `false`            | Marks the listing’s main image        |
| verification_status | VARCHAR(20)  | Not null, default `pending`          | Media review status                   |
| created_at          | TIMESTAMPTZ  | Not null, default current time       | Records upload time                   |
| updated_at          | TIMESTAMPTZ  | Not null, default current time       | Records latest update                 |

### Allowed Media Types

- `image`
- `video`
- `virtual_tour`

### Allowed Verification Statuses

- `pending`
- `approved`
- `rejected`

### Media Rules

- Every published property must have at least one approved image.
- A property can have only one cover image.
- Only approved media can appear publicly.
- Images must include useful alternative text.
- Media files must be validated by file type and size before storage.
- File names supplied by users must not be trusted as storage identifiers.
- Removing a database record must also trigger safe removal of its stored file.
- Private media must use temporary signed URLs rather than permanent public URLs.

### Relationships

- One property can have many media records.
- Each media record belongs to exactly one property.

## `properties (1) -> (many) property_media`

## 6. Amenities Table

The `amenities` table provides a controlled catalogue of features that can be attached to properties or individual units.

| Column        | Data type    | Rules                          | Purpose                                |
| ------------- | ------------ | ------------------------------ | -------------------------------------- |
| id            | UUID         | Primary key                    | Unique amenity identifier              |
| name          | VARCHAR(100) | Not null, unique               | Public amenity name                    |
| slug          | VARCHAR(100) | Not null, unique               | Stable code used by the application    |
| category      | VARCHAR(30)  | Not null                       | Groups similar amenities               |
| description   | TEXT         | Optional                       | Explains the amenity                   |
| allowed_scope | VARCHAR(20)  | Not null                       | Determines where it can be assigned    |
| is_active     | BOOLEAN      | Not null, default `true`       | Controls whether it remains selectable |
| created_at    | TIMESTAMPTZ  | Not null, default current time | Records creation time                  |

### Amenity Categories

- `utilities`
- `security`
- `comfort`
- `accessibility`
- `parking`
- `shared_facilities`
- `connectivity`

### Allowed Scopes

- `property`
- `unit`
- `both`

### Example Amenities

- Running water
- Electricity
- Backup power
- Security guard
- Perimeter fence
- Parking
- Wi-Fi
- Kitchen
- Wardrobe
- Air conditioning

---

## 7. Property Amenities Table

This junction table connects shared amenities to properties.

| Column      | Data type    | Rules                          | Purpose                       |
| ----------- | ------------ | ------------------------------ | ----------------------------- |
| property_id | UUID         | References `properties.id`     | Selected property             |
| amenity_id  | UUID         | References `amenities.id`      | Selected amenity              |
| details     | VARCHAR(250) | Optional                       | Property-specific explanation |
| created_at  | TIMESTAMPTZ  | Not null, default current time | Records assignment            |

### Constraints

- The combination of `property_id` and `amenity_id` is the primary key.
- The same amenity cannot be added to a property twice.
- Only amenities with scope `property` or `both` can be assigned.

---

## 8. Unit Amenities Table

This junction table connects amenities to individual rentable units.

| Column     | Data type    | Rules                          | Purpose                   |
| ---------- | ------------ | ------------------------------ | ------------------------- |
| unit_id    | UUID         | References `property_units.id` | Selected unit             |
| amenity_id | UUID         | References `amenities.id`      | Selected amenity          |
| details    | VARCHAR(250) | Optional                       | Unit-specific explanation |
| created_at | TIMESTAMPTZ  | Not null, default current time | Records assignment        |

### Constraints

- The combination of `unit_id` and `amenity_id` is the primary key.
- The same amenity cannot be added to a unit twice.
- Only amenities with scope `unit` or `both` can be assigned.

### Relationships

- Properties and amenities have a many-to-many relationship.
- Units and amenities have a many-to-many relationship.

---

## 9. Property Contacts Table

The `property_contacts` table stores private contact information for people responsible for a property.

This table must not be publicly readable.

| Column              | Data type    | Rules                                | Purpose                              |
| ------------------- | ------------ | ------------------------------------ | ------------------------------------ |
| id                  | UUID         | Primary key                          | Unique contact record                |
| property_id         | UUID         | Not null, references `properties.id` | Connected property                   |
| profile_id          | UUID         | Optional, references `profiles.id`   | Connected platform account           |
| contact_name        | VARCHAR(100) | Not null                             | Name of responsible person           |
| contact_role        | VARCHAR(20)  | Not null                             | Relationship to the property         |
| phone_number        | VARCHAR(20)  | Optional                             | Private contact number               |
| email               | VARCHAR(254) | Optional                             | Private contact email                |
| is_primary          | BOOLEAN      | Not null, default `false`            | Identifies the main contact          |
| verification_status | VARCHAR(20)  | Not null, default `pending`          | Contact verification result          |
| consent_to_contact  | BOOLEAN      | Not null, default `false`            | Confirms permission to share contact |
| created_at          | TIMESTAMPTZ  | Not null, default current time       | Records creation                     |
| updated_at          | TIMESTAMPTZ  | Not null, default current time       | Records latest update                |

### Allowed Contact Roles

- `platform_admin`
- `landlord`
- `caretaker`
- `agent`

### Allowed Verification Statuses

- `pending`
- `verified`
- `rejected`

### Contact Rules

- At least one of `phone_number` or `email` must be provided.
- A property can have only one primary contact.
- Contact information cannot be released without consent.
- An agent must be explicitly labelled as an agent.
- Only verified contacts can receive customer inquiries.
- Public visitors cannot query this table.
- Logged-in customers cannot directly query this table.
- Authorised backend operations control when contact information is released.

### Security Rules

- Supabase Row Level Security must be enabled.
- No public `SELECT` policy should be created.
- Contact data must never be included in public property API responses.
- Backend logs must not print phone numbers or email addresses.
- The Supabase service-role key must remain on the backend only.
- The service-role key must never be placed in the React `.env` file.

### Relationships

- One property can have several contacts.
- One profile may manage several property contacts.
- Each property has at most one primary contact.
