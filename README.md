# Multi-Tenant SaaS Platform

Dockerized multi-tenant SaaS application built with Node.js, Express, PostgreSQL, and React. The project now includes the full evaluator-facing API surface, tenant-scoped authentication, working project and user creation flows in the UI, and explicit database schema documentation.

## Features
- Tenant registration with automatic tenant admin provisioning
- JWT authentication with tenant-aware login
- Role-based access control for super admins, tenant admins, and users
- Tenant management, user management, project CRUD, and task updates
- Protected React routes with dashboard, projects, project detail, and users pages
- Docker Compose startup for database, backend, and frontend
- Automatic schema migration and seed data on backend start
- Health check endpoint for automated evaluation

## Architecture
- Frontend: React SPA served through Nginx on port `3000`
- Backend: Express API on port `5000`
- Database: PostgreSQL on port `5432`
- Multi-tenancy model: shared database with `tenant_id` filtering on tenant-owned records

Diagrams:
- System architecture: `docs/images/system-architecture.png`
- Database ERD: `docs/images/database-erd.png`

## Quick Start
```bash
docker compose up --build -d
```

Open:
- Frontend: [http://localhost:3000](http://localhost:3000)
- Backend: [http://localhost:5000](http://localhost:5000)
- Health check: [http://localhost:5000/api/health](http://localhost:5000/api/health)

Stop the stack:
```bash
docker compose down
```

Reset the database:
```bash
docker compose down -v
docker compose up --build -d
```

## Seed Credentials
### Tenant Admin
- Email: `admin@demo.com`
- Password: `Admin@123`
- Tenant subdomain: `demo`

### Super Admin
- Email: `superadmin@platform.dev`
- Password: `SuperAdmin@123`

## Key Endpoints
- `POST /api/auth/register-tenant`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/tenants`
- `POST /api/tenants/:tenantId/users`
- `GET /api/projects`
- `POST /api/projects/:projectId/tasks`
- `PATCH /api/tasks/:taskId/status`

The complete endpoint catalog is documented in `docs/API.md`.

## Documentation
- Product requirements: `docs/PRD.md`
- Research: `docs/research.md`
- Architecture: `docs/architecture.md`
- Technical specification: `docs/technical-spec.md`
- API reference: `docs/API.md`
- Database schema: `backend/database/schema.sql`

## Environment Setup
Reference values live in:
- `.env.example`
- `backend/.env.example`

Docker Compose includes safe defaults so the project can run without committed secret files.

## Submission Notes
- `submission.json` includes backend/frontend URLs and test credentials
- The repository now includes `.gitignore`, database schema assets, and evaluator-ready docs
- Demo video link still needs to be recorded and added before final submission
