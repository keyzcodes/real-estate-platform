# ADR-011: Zero-Cost Hosting, Monitoring and Service Continuity

## Status

Accepted for the initial public pilot.

Implementation pending.

## Date

19 September 2026

## Decision Owner

Sunday Jime

## Related Decisions

- ADR-001: Technology Stack
- ADR-003: Free-Tier Infrastructure
- ADR-007: Public API Security and Migration Strategy
- ADR-008: Automated Testing Strategy
- ADR-010: Self-Service Provider Authentication and Authorization

## Context

The platform currently depends on local frontend and backend development
servers. It must become publicly accessible without requiring the developer's
computer to remain online.

The initial deployment must remain at zero monetary cost. A future paid upgrade
must not be assumed.

Free hosting introduces several risks:

- Backend services may scale to zero after inactivity.
- Supabase may pause low-activity Free Plan projects.
- Scheduled monitoring may be delayed or disabled.
- Free plans do not provide guaranteed end-to-end availability.
- Failures may remain unnoticed without independent monitoring.
- Monitoring does not replace database backups.

The platform therefore requires both public hosting and direct phone
notification when an important component becomes unavailable.

## Decision

The initial public-pilot infrastructure will use:

| Responsibility                | Platform                  |
| ----------------------------- | ------------------------- |
| React frontend                | Cloudflare Pages          |
| Express backend               | Koyeb Free Web Service    |
| PostgreSQL and authentication | Supabase Free Plan        |
| Source control and CI         | GitHub and GitHub Actions |
| Scheduled health monitoring   | GitHub Actions            |
| Phone notifications           | Telegram Bot API          |
| Optional secondary monitoring | UptimeRobot Free          |

### Deployment Topology

| Component        | Communicates with                            | Responsibility                               |
| ---------------- | -------------------------------------------- | -------------------------------------------- |
| Cloudflare Pages | Browser, Express API and Supabase Auth       | Serves the React application                 |
| Koyeb            | React frontend and Supabase                  | Runs the Express API                         |
| Supabase         | React frontend, Express API and Google OAuth | Provides Auth, PostgreSQL, PostgREST and RLS |
| GitHub Actions   | Cloudflare, Koyeb, Supabase and Telegram     | Performs health and keep-alive checks        |
| Telegram Bot     | Decision owner's Telegram account            | Delivers failure notifications               |
| UptimeRobot      | Public frontend and health endpoints         | Provides an optional independent check       |

The browser remains an untrusted client. Authorization continues to depend on
validated Supabase identities, authoritative database roles and Row Level
Security.

## Frontend Hosting

Cloudflare Pages will host the production React build.

It was selected because:

- The React application builds into static files.
- No continuously running frontend process is required.
- It supports GitHub-based deployments.
- Static assets are delivered through Cloudflare's network.
- Its Free Plan limits are sufficient for the initial pilot.

Production deployments will follow reviewed changes merged into `main`.

Only browser-safe values may be configured as `VITE_` variables.

## Backend Hosting

Koyeb will host the Express API on one Free Web Service in Frankfurt.

Frankfurt was selected as the more suitable available Free-instance region for
the initial Nigerian audience. Actual latency must be measured after deployment.

Koyeb currently documents the Free Instance as providing:

- 512 MB RAM
- 0.1 vCPU
- 2 GB SSD
- One Free Instance per organization
- Automatic scale-to-zero after one hour without traffic

Koyeb describes the Free Instance as suitable for hobby and testing workloads,
not production applications. This deployment is therefore classified as a
controlled public pilot rather than production-grade infrastructure.

The backend must not depend on local persistent storage.

## Database and Authentication

Supabase will continue providing:

- PostgreSQL
- Supabase Auth
- Google OAuth integration
- PostgREST
- Row Level Security
- Database functions
- Forward-only migrations

Supabase states that Free Plan applications with low activity during a
seven-day period may be paused.

A real, read-only database request will therefore be performed during every
scheduled monitoring run. This reduces inactivity risk but does not guarantee
that Supabase will never pause the project.

## Monitoring and Keep-Alive

A GitHub Actions workflow will check the deployed platform every 20 minutes.

The schedule will be `11,31,51 * * * *`.

These minutes avoid the beginning of the hour, when GitHub states that scheduled
workflows are more likely to be delayed.

Each run will check:

| Check                      | Purpose                                                   |
| -------------------------- | --------------------------------------------------------- |
| Production frontend        | Confirms Cloudflare serves the expected React application |
| `GET /api/v1/health`       | Confirms Koyeb routing and the Express process            |
| `GET /api/v1/health/ready` | Confirms the backend can reach Supabase                   |
| Safe Supabase REST query   | Confirms Supabase responds independently of Koyeb         |

The 20-minute interval provides more safety margin than a 45-minute interval
against Koyeb's one-hour inactivity period.

Monitoring and keep-alive requests are best-effort controls. They do not
guarantee availability.

## Health Endpoints

The existing `GET /api/v1/health` endpoint will remain a lightweight backend
liveness check.

A new `GET /api/v1/health/ready` endpoint will:

- Perform a small, read-only Supabase query
- Preserve RLS
- Return `200` when the dependency is available
- Return `503` when a required dependency is unavailable
- Use a bounded timeout
- Disable caching
- Expose no SQL, secrets, records or stack traces
- Make no changes to application data

## Telegram Notifications

A private Telegram bot created through the official `@BotFather` will deliver
monitoring failures to the decision owner's phone.

The following values will be stored as GitHub Actions secrets:

- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_CHAT_ID`
- `SUPABASE_PUBLISHABLE_KEY`

Alerts may contain:

- Failed component names
- UTC timestamp
- Repository name
- GitHub Actions run URL

Alerts must not contain:

- Access tokens
- Secret values
- Database records
- Full response bodies
- Stack traces
- Personal information

The workflow will support manual execution and an explicit test-alert option.

A weekly successful heartbeat will confirm that GitHub Actions and Telegram
notification delivery are still operating.

## Optional UptimeRobot Monitoring

UptimeRobot Free may later be added as an independent monitor for:

- The Cloudflare Pages frontend
- The backend readiness endpoint

It remains optional because UptimeRobot's native Telegram integration currently
requires a paid plan.

If enabled without payment, UptimeRobot will use its own mobile application
notifications rather than the custom Telegram bot.

## Security Requirements

The deployment must:

- Preserve all existing RLS policies
- Use only the Supabase publishable key for ordinary operations
- Never use the service-role key for monitoring
- Keep Telegram credentials out of source code
- Keep real secrets out of `.env.example`
- Use the exact production frontend origin for CORS
- Use exact approved OAuth callback URLs
- Reject caller-controlled redirect destinations
- Expose only safe, read-only health endpoints
- Give the monitoring workflow minimum GitHub permissions
- Avoid exposing secrets to pull-request workflows
- Avoid logging authorization headers or access tokens

Values prefixed with `VITE_` must be treated as public because they are included
in the frontend bundle.

## Deployment Process

Production changes will follow this order:

1. Implement on a feature branch.
2. Run frontend, backend and database tests.
3. Open and review a pull request.
4. Merge only after required checks pass.
5. Apply reviewed forward-only database migrations when required.
6. Deploy the backend from `main`.
7. Deploy the frontend from `main`.
8. Run production smoke tests.
9. Test the Telegram notification path.
10. Confirm scheduled monitoring succeeds.

Database migrations will continue using a reviewed dry run before remote
application.

## Limitations

This architecture cannot guarantee that the platform will always remain online.

Known limitations include:

- Koyeb may change its Free Plan conditions.
- Supabase may still pause or suspend the project.
- GitHub scheduled workflows may be delayed or dropped.
- GitHub may disable schedules after 60 days without repository activity.
- Telegram notifications may be muted or delayed.
- HTTP checks do not test the complete Google OAuth journey.
- Healthy endpoints do not prove every application feature works.
- Free infrastructure provides no contractual uptime guarantee.

Google OAuth will therefore be manually verified after deployment and after
OAuth or domain configuration changes.

## Backup Boundary

Monitoring is not a backup.

A separate decision must define encrypted logical backups, retention and
restoration testing before the platform stores irreplaceable real-user data.

Unencrypted database dumps must never be committed to the public repository or
included in public workflow logs.

## Alternatives Considered

### Continue Using Localhost

Rejected because the platform would disappear whenever the developer's computer
or development servers are offline.

### Depend Only on Real User Traffic

Rejected because pilot traffic cannot be guaranteed and failures could remain
undetected.

### Use Only the Static Backend Health Endpoint

Rejected because it does not prove that the database is reachable.

### Check Supabase Every Three Days

Rejected because an outage could remain unnoticed for nearly three days.

### Ping Koyeb Every 45 Minutes

Rejected because it leaves too little margin before the one-hour inactivity
threshold.

### Use UptimeRobot as the Only Monitor

Rejected because its native Telegram integration currently requires a paid
plan. It remains available as an optional independent monitor.

### Use Email as the Only Notification Channel

Rejected because operational emails may be buried among ordinary messages.

## Consequences

### Positive

- The platform will no longer depend on the developer's laptop.
- The initial hosting cost remains zero.
- The backend and database receive regular real requests.
- Failures can be delivered directly to the owner's phone.
- Frontend, backend and database failures can be distinguished.
- Existing authentication and RLS protections remain authoritative.
- An optional independent monitor can be added later.

### Negative

- The deployment is not production-grade.
- Free-plan policies may change.
- GitHub Actions is not a guaranteed scheduler.
- Repeated failure alerts may become noisy.
- Google OAuth still requires manual smoke testing.
- Monitoring does not provide data recovery.
- Several provider dashboards must be maintained.

## Implementation Boundary

This decision authorizes:

- Cloudflare Pages deployment
- Koyeb backend deployment
- Continued Supabase hosting
- A safe readiness endpoint
- GitHub Actions health checks
- Best-effort keep-alive requests
- Telegram alerts
- Optional UptimeRobot Free monitoring

It does not authorize:

- Any paid hosting or monitoring plan
- Service-role use for monitoring
- Weakening RLS
- Public storage of secrets or backups
- Wildcard production CORS or OAuth redirects
- Claims of guaranteed uptime
- Destructive database migration automation

## Review Triggers

Review this decision when:

- A selected provider changes its Free Plan
- The repository becomes private
- Scheduled monitoring becomes unreliable
- Koyeb or Supabase limits are approached
- The platform begins storing irreplaceable user data
- A backup and restoration system is introduced
- A custom production domain is introduced
- Sustained public traffic begins
- Production-grade availability becomes necessary
- The zero-cost requirement changes

## References

- [Cloudflare Pages limits](https://developers.cloudflare.com/pages/platform/limits/)
- [Koyeb Free Instance limits](https://www.koyeb.com/docs/reference/instances)
- [Koyeb scale-to-zero](https://www.koyeb.com/docs/run-and-scale/scale-to-zero)
- [Supabase production checklist](https://supabase.com/docs/guides/deployment/going-into-prod)
- [GitHub scheduled workflows](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#schedule)
- [GitHub Actions billing](https://docs.github.com/en/billing/concepts/product-billing/github-actions)
- [Telegram Bot API](https://core.telegram.org/bots/api)
- [UptimeRobot pricing](https://uptimerobot.com/pricing/)
- [UptimeRobot Telegram integration](https://uptimerobot.com/integrations/telegram-integration/)
