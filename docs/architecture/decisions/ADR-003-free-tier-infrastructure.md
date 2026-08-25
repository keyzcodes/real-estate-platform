# ADR-003: Free-Tier Infrastructure Strategy

## Status

Accepted for MVP development

## Date

2026-08-24

## Context

The Real Estate Platform is currently in its MVP development phase and does not yet generate revenue.

The project needs database, authentication, storage, backend hosting, frontend hosting and source control services. Initial development must avoid infrastructure costs while preserving a clear upgrade path.

The platform may eventually process bookings, property information, personal information and financial transactions. Free-tier services are therefore temporary development and validation infrastructure, not a permanent production guarantee.

## Decision

Use free-tier services during MVP development and early product validation.

### Current Infrastructure

| Component           | Service          | Plan           | Region         | Status   |
| ------------------- | ---------------- | -------------- | -------------- | -------- |
| PostgreSQL database | Supabase         | Free           | London         | Active   |
| Authentication      | Supabase Auth    | Free           | London         | Active   |
| File storage        | Supabase Storage | Free           | London         | Planned  |
| Express backend     | Koyeb            | Free           | Frankfurt      | Planned  |
| React frontend      | To be selected   | Free           | To be selected | Pending  |
| Source control      | GitHub           | Free           | Global         | Planned  |
| Payments            | Not selected     | Not applicable | Not applicable | Deferred |

## Reasons

- No infrastructure budget is currently available.
- The MVP must validate the product before paid scaling.
- Supabase provides PostgreSQL, authentication, storage and Row Level Security.
- Koyeb supports standard Node.js and Express deployment.
- Using standard technologies reduces vendor lock-in.
- Infrastructure can be upgraded or migrated without rewriting the core business domain.

## Alternatives Considered

### Self-hosting

Rejected for the MVP because it requires server administration, security patching, monitoring, backups and continuous availability.

### Render

Suitable for Express, but its free web services currently sleep after short periods of inactivity. It remains a possible alternative.

### Railway

Provides a good developer experience, but its long-term free allowance may not be sufficient for the project.

### Serverless-only Backend

Not selected because the project is intended to teach conventional Express architecture and may later require workflows that are easier to manage in a dedicated backend service.

## Free-Tier Limitations

- Services may sleep after inactivity and cause cold starts.
- CPU, memory, storage and bandwidth are limited.
- Free plans may not provide production uptime guarantees.
- Backup and recovery features may be limited.
- Logs may have short retention periods.
- Provider pricing and limits can change.
- Support may be community-based only.
- Free infrastructure is not sufficient evidence of production readiness.

## Risk Controls

- Keep all schema changes in version-controlled migrations.
- Store no secrets in Git.
- Use environment variables for credentials.
- Enable Row Level Security on exposed tables.
- Store media outside PostgreSQL.
- Monitor storage, bandwidth and request usage.
- Review free-tier limits before every public launch.
- Avoid accepting real payments until reliability, recovery and dispute workflows are ready.
- Keep infrastructure-specific code behind services and configuration.

## Upgrade Triggers

A service must be reviewed for upgrade when any of these occurs:

- Usage reaches approximately 70–80% of a free limit.
- Cold starts materially affect user experience.
- The platform begins processing significant real transactions.
- Reliable automated backups or point-in-time recovery become necessary.
- Storage or bandwidth limits affect property media.
- Uptime becomes important to customers or providers.
- Security, audit or legal requirements exceed free-plan capabilities.
- Revenue can support the operating cost.
- A provider changes or removes its free plan.

An upgrade should happen before a known limit causes an outage, data loss or failed transaction.

## Consequences

### Positive

- Development can continue without immediate infrastructure costs.
- Architecture remains based on standard Node.js and PostgreSQL.
- The team gains experience with managed cloud services.
- Early product validation can occur before significant spending.

### Negative

- Initial requests may be slow after backend inactivity.
- Free services may impose changing limits.
- Some production recovery and monitoring features will be unavailable.
- Infrastructure must be reviewed before commercial launch.

## Review Schedule

Review this decision:

- Before accepting real payments
- Before public commercial launch
- When traffic begins increasing
- When any provider changes its pricing or free-tier limits
- At least once per development sprint involving infrastructure
