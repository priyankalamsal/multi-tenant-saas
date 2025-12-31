# Research – Multi-Tenant SaaS Architecture

## Multi-Tenancy Strategy
This system uses a shared-database, tenant-isolated architecture where each record contains a tenant_id. All queries are filtered by tenant_id extracted from JWT claims.

---

## Authentication & Security
- Passwords hashed using bcrypt
- JWT used for stateless authentication
- Authorization middleware enforces access rules
- Role-based access prevents unauthorized operations

---

## Technology Stack Justification
- Node.js: lightweight, scalable backend
- PostgreSQL: reliable relational database
- Docker: reproducible environments
- React: component-based frontend architecture

---

## Security Considerations
- SQL injection prevention via parameterized queries
- JWT signature validation
- No plaintext passwords stored
- Environment variables for secrets
