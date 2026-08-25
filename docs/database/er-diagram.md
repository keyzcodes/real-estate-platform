# Entity-Relationship Diagram

## Purpose

This document defines the Phase 1 database entities and their relationships before SQL migrations are written.

## Core Design Principle

A property and a listing are different records.

```text
Property = physical building
Property unit = rentable part of the building
Listing = current commercial offer for a unit\

```

# Entity Relationship Diagram

## Project

Real Estate Platform

## Purpose

This document visually describes the database entities and their relationships before SQL implementation.

## Property Catalogue Relationships

```mermaid
erDiagram
    AUTH_USERS ||--o| PROFILES : has
    PROFILES ||--o{ PROPERTIES : creates

    PROPERTIES ||--o{ PROPERTY_UNITS : contains
    PROPERTIES ||--o{ PROPERTY_MEDIA : displays
    PROPERTIES ||--o{ PROPERTY_CONTACTS : managed_by
    PROPERTIES ||--o{ PROPERTY_AMENITIES : has

    AMENITIES ||--o{ PROPERTY_AMENITIES : assigned_to
    AMENITIES ||--o{ UNIT_AMENITIES : assigned_to

    PROPERTY_UNITS ||--o{ UNIT_AMENITIES : has
    PROPERTY_UNITS ||--o{ UNIT_FEES : charges

    PROFILES |o--o{ PROPERTY_CONTACTS : represents
```

## Customer Workflow Relationships

```mermaid
erDiagram
    PROFILES ||--o{ INQUIRIES : submits
    PROPERTIES ||--o{ INQUIRIES : receives
    PROPERTY_UNITS |o--o{ INQUIRIES : concerns
    PROPERTY_CONTACTS |o--o{ INQUIRIES : handles

    PROFILES ||--o{ BOOKINGS : creates
    PROPERTY_UNITS ||--o{ BOOKINGS : reserved_through
    BOOKINGS ||--|{ BOOKING_OCCUPANTS : includes
    PROFILES |o--o{ BOOKING_OCCUPANTS : may_represent
```

## Payment Boundary

Payment entities are intentionally excluded from the current MVP design.

They will later connect to bookings without changing the existing relationships:

```mermaid
erDiagram
    BOOKINGS ||--o{ PAYMENT_ATTEMPTS : receives
```
