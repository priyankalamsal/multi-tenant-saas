# Product Requirements Document

## Product Goal
Build a multi-tenant SaaS workspace that lets each tenant manage its own users, projects, and tasks without leaking data to other tenants.

## User Personas
### Super Admin
- Oversees the entire platform
- Can inspect tenants across the system
- Supports onboarding and escalations

### Tenant Admin
- Creates and manages users inside a single tenant
- Creates projects and tasks for that tenant
- Updates tenant profile information

### Regular User
- Signs into an assigned tenant
- Views tenant-approved projects and tasks
- Updates work progress when allowed

## Core User Journeys
1. A new company registers a tenant and creates the first tenant admin.
2. The tenant admin logs in with the tenant subdomain and reaches a protected dashboard.
3. The tenant admin adds users to the tenant and assigns them work.
4. The tenant admin creates projects and tasks that remain visible only inside the tenant.
5. Platform operations staff review tenant state when troubleshooting cross-tenant issues.

## Functional Requirements
1. The system must allow a new tenant to register through `POST /api/auth/register-tenant`.
2. The platform must hash all stored passwords before persistence.
3. The login flow must support tenant-scoped authentication using email, password, and subdomain.
4. The backend must issue JWT tokens for authenticated sessions.
5. Protected routes must redirect unauthenticated users to the login page.
6. The API must expose a current-user endpoint so the frontend can hydrate the active session.
7. Tenant admins must be able to list and update their own tenant details.
8. Tenant admins must be able to create tenant users.
9. Tenant admins must be able to update and delete tenant users.
10. Authenticated users must be able to list tenant projects.
11. Tenant admins must be able to create, update, and delete projects.
12. Tenant admins must be able to create project tasks.
13. Authenticated users must be able to list tasks for a project.
14. Authenticated users must be able to update task status.
15. Authenticated users must be able to update task details.
16. The dashboard must summarize project and task counts for the signed-in tenant.
17. The users page must include a working add-user flow.
18. The projects page must include a working create-project flow.
19. The system must expose a health check endpoint for automated evaluation.
20. The repository must include database schema documentation and setup instructions.

## Non-Functional Requirements
- All tenant-owned queries must be filtered by tenant context.
- Docker startup must be reproducible with a single command.
- Environment configuration must stay out of version-controlled secret files.
- Documentation must be sufficient for evaluator setup and manual review.
