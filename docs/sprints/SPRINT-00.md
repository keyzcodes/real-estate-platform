# Sprint 0 — Project Foundation

## Sprint Information

| Item                | Value                       |
| ------------------- | --------------------------- |
| Sprint              | Sprint 0                    |
| Status              | Completed                   |
| Start date          | 22 August 2026              |
| Completion date     | 25 August 2026              |
| Developer           | Sunday Jime                 |
| Development process | Agile, iterative development |
| Primary branch      | `main`                      |

## Sprint Goal

Establish a clean, documented and working foundation for the Real Estate Platform before implementing product features.

## Outcome

Sprint 0 established the repository, frontend, backend, database design, security foundation and development workflow required for subsequent feature development.

The project progressed beyond the original Sprint 0 plan because the Supabase connection and database foundation were implemented earlier than initially expected.

## Completed Scope

- Renamed the project to `real-estate-platform`
- Removed the obsolete campus-hostel structure
- Organized the root, frontend, backend and documentation directories
- Initialized Git and renamed the primary branch to `main`
- Connected the repository to GitHub
- Configured the React frontend with Vite
- Configured the Express backend
- Added environment-variable handling
- Connected the backend to Supabase
- Defined Phase 1 product requirements
- Documented the system architecture
- Recorded the initial architecture decisions
- Designed the PostgreSQL database relationships
- Documented database constraints and indexes
- Created the entity-relationship diagram
- Added security and provider-verification designs
- Added database migrations and Row Level Security policies
- Created and pushed the initial foundation commit to GitHub

## Out of Scope

The following product features were intentionally excluded from Sprint 0:

- Public property catalogue
- Administrator dashboard
- Complete authentication workflow
- Google Maps integration
- Cloudinary delivery integration
- Provider onboarding
- Booking
- Payment processing

The public property catalogue was implemented separately in Sprint 1.

## Sprint Backlog

| ID     | Task                                         | Status    |
| ------ | -------------------------------------------- | --------- |
| S0-001 | Initialize the Git repository                | Done      |
| S0-002 | Rename the primary branch to `main`          | Done      |
| S0-003 | Rename the project to `real-estate-platform` | Done      |
| S0-004 | Remove the obsolete campus-hostel structure  | Done      |
| S0-005 | Remove the duplicate frontend structure      | Done      |
| S0-006 | Remove empty placeholder files               | Done      |
| S0-007 | Configure the React frontend with Vite       | Done      |
| S0-008 | Confirm the React frontend starts            | Done      |
| S0-009 | Configure the Express backend foundation     | Done      |
| S0-010 | Confirm the Express backend starts           | Done      |
| S0-011 | Create the project README                    | Done      |
| S0-012 | Define Phase 1 product requirements          | Done      |
| S0-013 | Document the system architecture             | Done      |
| S0-014 | Document the technology-stack decision       | Done      |
| S0-015 | Document the database decision               | Done      |
| S0-016 | Create the Sprint 0 document                 | Done      |
| S0-017 | Document backend environment variables       | Done      |
| S0-018 | Document frontend environment variables      | Deferred  |
| S0-019 | Design the database relationships            | Done      |
| S0-020 | Create the database ER diagram               | Done      |
| S0-021 | Create a separate database data dictionary   | Deferred  |
| S0-022 | Review the project structure                 | Done      |
| S0-023 | Review `.gitignore`                          | Done      |
| S0-024 | Review installed dependencies                | Done      |
| S0-025 | Create and review the first Git commit       | Done      |
| S0-026 | Create the GitHub repository                 | Done      |
| S0-027 | Connect the local repository to GitHub       | Done      |
| S0-028 | Push `main` to GitHub                        | Done      |
| S0-029 | Create the GitHub Project board              | Deferred  |
| S0-030 | Complete the sprint review                   | Done      |
| S0-031 | Complete the sprint retrospective            | Done      |

## Deliverables

Sprint 0 produced or established:

```text
README.md
CHANGELOG.md
backend/
frontend/
supabase/
docs/requirements/product-requirements.md
docs/architecture/system-architecture.md
docs/architecture/decisions/ADR-001-technology-stack.md
docs/architecture/decisions/ADR-002-database-choice.md
docs/architecture/decisions/ADR-003-free-tier-infrastructure.md
docs/architecture/decisions/ADR-004-media-storage-and-virtual-tours.md
docs/database/database-design.md
docs/database/constraints-and-indexes.md
docs/database/er-diagram.md
docs/database/provider-verification-design.md
docs/security/data-retention-and-erasure.md
docs/sprints/SPRINT-00.md

Engineering Decisions
Build the foundation before the user interface

The database, security rules and backend structure were prioritized before building a polished interface.

This reduced the risk of designing frontend behaviour around an incomplete or insecure data model.

Use a modular backend architecture

The Express backend was organized into configuration, routes, controllers, services, repositories, middleware, validators and utilities.

This separation makes the codebase easier to understand, test and extend.

Use Supabase and PostgreSQL

Supabase was selected to provide PostgreSQL, authentication, Row Level Security and managed infrastructure while keeping the project suitable for an early-stage budget.

Protect data at multiple layers

Security responsibilities were distributed across:

Database constraints
PostgreSQL permissions
Row Level Security
Backend validation
Controlled API responses
Environment-variable management
Use Git branches for feature development

The stable foundation was committed to main. Later features are developed on isolated branches and reviewed before merging.

Problems Encountered
Obsolete files remained from the earlier campus-hostel project.
Duplicate frontend structures caused confusion.
Vite referenced deleted default assets.
The backend initially lacked complete startup configuration.
Git and repository structure had to be established from the project root.
Environment variables needed to be separated from committed source code.
Database relationships and security responsibilities required clarification before implementation.
Lessons Learned
Repository structure should reflect application responsibilities.
Environment secrets must never be committed.
Database security should not depend only on frontend restrictions.
Constraints and relationships prevent invalid data from entering the system.
Architecture decisions should be recorded when they are made.
Feature development is safer when performed on an isolated Git branch.
A working foundation reduces rework during later feature development.
Sprint Review

Sprint 0 met its primary goal.

The repository, frontend, backend, database documentation, Supabase foundation and GitHub workflow were established successfully. Deferred items were not blockers and can be completed when their related functionality becomes necessary.

The initial project foundation was committed to main and pushed to GitHub.

Sprint Retrospective
What went well
The project was successfully transformed from a campus-hostel concept into a broader real estate platform.
The repository was cleaned and reorganized.
Architecture and database decisions were documented early.
Both frontend and backend startup processes were verified.
Git and GitHub were integrated into the development workflow.
Database and security work progressed earlier than originally planned.
What could be improved
Sprint status should be updated immediately when work is completed.
Documentation should be updated in the same branch as the corresponding implementation.
Large tasks should be divided into smaller, verifiable checkpoints.
Deferred work should be clearly identified instead of remaining marked To Do.
Encoding should be checked when Markdown files are created or edited in PowerShell.
Action items
Create a dedicated sprint document for every major feature.
Add or update API documentation before merging a feature.
Record important architectural decisions as ADRs.
Run positive, negative and privacy tests before opening a Pull Request.
Complete a sprint review and retrospective before starting the next sprint.