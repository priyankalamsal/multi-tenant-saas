# Research: Multi-Tenant SaaS Architecture

## Problem Space
The application needs to support many customer organizations from one deployment while ensuring that one tenant cannot read or modify another tenant's data. The solution also needs to stay lightweight enough for a coding assessment environment that values setup speed and reproducibility.

## Multi-Tenancy Models Considered
### Separate database per tenant
- Strong isolation boundary
- Higher operational overhead for migrations, backups, and connection management
- Not ideal for a small assessment-sized project

### Separate schema per tenant
- Better logical separation than shared tables
- More complex schema management and automation
- Harder to keep simple for a single-compose deployment

### Shared database with tenant discriminator
- Lowest infrastructure complexity
- Fastest to evaluate in Docker
- Requires disciplined tenant filtering in every tenant-owned query

## Selected Approach
The project uses a shared PostgreSQL database with a `tenant_id` discriminator on tenant-owned tables. This was chosen because it provides a good balance of simplicity, cost efficiency, and demonstrable multi-tenant behavior for a single-node assessment environment.

## Security Considerations
### Authentication
- Passwords are hashed with `bcrypt`
- JWT tokens carry the user id, role, and tenant context
- `GET /api/auth/me` verifies active session state

### Authorization
- Tenant admins are limited to their own tenant for tenant-scoped routes
- Super admins can access global or cross-tenant views when necessary
- Project and task routes verify that the target record belongs to the authenticated tenant

### Data Isolation Risks
- Missing tenant filters can leak data across accounts
- Reused user ids or task ids without ownership checks can enable insecure direct object access
- Shared-database systems must validate both the user role and the resource tenant on every mutation

## Operational Tradeoffs
- Shared-database design is fast to bootstrap and easy to inspect
- The backend must be deliberate about query composition to keep isolation reliable
- Seed data should include more than one tenant so isolation logic can be verified during testing

## Technology Stack Rationale
- React: fast to build evaluator-facing workflows and protected pages
- Express: simple REST API with explicit middleware for auth and tenant checks
- PostgreSQL: relational model fits tenant, user, project, and task entities
- Docker Compose: reproducible startup for evaluators and collaborators

## Conclusion
The chosen architecture prioritizes clear isolation behavior, small operational footprint, and assessment-friendly deployment while still demonstrating the core patterns of a production multi-tenant SaaS application.
