# ADR-001: Technology Stack

## Status

Accepted

## Date

22 August 2026

## Context

The Real Estate Platform needs a technology stack that:

- Supports a public property marketplace
- Supports a secure administrator dashboard
- Works well on mobile devices
- Can integrate with maps, media and authentication services
- Can scale beyond the initial UNIMAID/Maiduguri market
- Is affordable during MVP development
- Is understandable to the current developer
- Provides valuable full-stack learning experience
- Can be maintained by future contributors

The developer currently understands HTML, CSS and JavaScript and is learning React.

## Decision

The project will use:

| Area                 | Technology                       |
| -------------------- | -------------------------------- |
| Programming language | JavaScript                       |
| Frontend             | React                            |
| Frontend build tool  | Vite                             |
| Frontend routing     | React Router                     |
| Styling              | CSS                              |
| Backend runtime      | Node.js                          |
| Backend framework    | Express                          |
| API style            | REST                             |
| Database             | Supabase PostgreSQL              |
| Authentication       | Supabase Auth                    |
| Media                | Cloudinary                       |
| Maps                 | Google Maps Platform             |
| Version control      | Git                              |
| Repository hosting   | GitHub                           |
| Testing              | Vitest, Supertest and Playwright |
| API documentation    | OpenAPI/Swagger                  |
| Deployment           | To be selected before production |

## 1. JavaScript

### Reason

JavaScript can be used in both the frontend and backend.

This allows the developer to:

- Strengthen one programming language
- Understand full-stack data flow
- Share basic knowledge between frontend and backend
- Reduce the number of new technologies introduced simultaneously

### Alternatives Considered

#### TypeScript

Advantages:

- Static type checking
- Better editor support
- Safer refactoring
- Better maintainability in larger codebases

Reason not selected initially:

The developer is still building confidence with JavaScript and React. Introducing TypeScript immediately could make it harder to distinguish JavaScript, React and type-system problems.

TypeScript remains a planned future improvement after the JavaScript architecture is understood.

#### Python

Advantages:

- Readable syntax
- Strong Django and FastAPI frameworks

Reason not selected:

It would require using different primary languages in the frontend and backend.

## 2. React

### Reason

React supports:

- Reusable interface components
- Interactive property filters
- Dynamic property galleries
- Administrator dashboards
- Form state
- Reusable layouts
- Strong professional demand

React also matches the developer’s current learning path.

### Alternatives Considered

#### Plain JavaScript

Advantages:

- No framework dependency
- Strong fundamentals

Reason not selected:

Managing a growing interactive application would require creating many patterns that React already provides.

#### Vue

Advantages:

- Approachable syntax
- Good component system

Reason not selected:

React better matches the current learning and portfolio direction.

#### Angular

Advantages:

- Strong enterprise structure
- Built-in application patterns

Reason not selected:

It introduces more framework concepts than the MVP currently requires.

## 3. Vite

### Reason

Vite provides:

- Fast development startup
- Fast updates during development
- Simple React configuration
- Production builds
- Modern frontend tooling

### Alternatives Considered

#### Create React App

Reason not selected:

It is no longer the preferred modern setup for new React applications.

#### Next.js

Advantages:

- Server rendering
- File-based routing
- Search-engine optimization features

Reason not selected initially:

The developer only recently started React. Learning React directly through Vite provides a clearer foundation before introducing Next.js concepts.

Next.js may be considered later if product requirements justify migration.

## 4. CSS

### Reason

Regular CSS allows the developer to strengthen:

- Responsive design
- Flexbox
- Grid
- Cascading
- Specificity
- Design variables
- Media queries

### Alternatives Considered

#### Tailwind CSS

Advantages:

- Rapid interface development
- Consistent design tokens

Reason not selected initially:

It could hide important CSS fundamentals while the developer is still learning.

Tailwind may be reconsidered after the initial design system is understood.

#### Bootstrap

Advantages:

- Fast standard layouts
- Existing components

Reason not selected:

It may produce a generic appearance and introduce styles that require overriding.

## 5. Node.js

### Reason

Node.js allows JavaScript to run on the backend.

It supports:

- REST APIs
- Authentication
- Database communication
- Media-service integration
- Map-service integration
- Email notifications

Using JavaScript in both frontend and backend reduces context switching.

## 6. Express

### Reason

Express provides a direct way to learn:

- HTTP requests and responses
- Routes
- Middleware
- Controllers
- Validation
- Authentication
- Error handling
- REST API design

### Alternatives Considered

#### NestJS

Advantages:

- Strong architecture
- Dependency injection
- Built-in module patterns

Reason not selected initially:

It introduces decorators, providers, modules and dependency injection before the developer understands the underlying Express concepts.

#### Fastify

Advantages:

- High performance
- Modern plugin system

Reason not selected:

Express provides a more beginner-accessible ecosystem for learning backend fundamentals.

## 7. REST API

### Reason

REST is:

- Easy to understand
- Easy to test
- Supported by browsers and mobile clients
- Easy to document with OpenAPI
- Appropriate for property and listing resources

Example resources:

```text
/properties
/listings
/inquiries
/reports
/verifications
```
