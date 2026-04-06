# Technical Specification

## Repository Structure
```text
.
├── backend
│   ├── database
│   │   └── schema.sql
│   ├── src
│   │   ├── config
│   │   ├── middleware
│   │   ├── routes
│   │   └── utils
│   ├── Dockerfile
│   └── .env.example
├── docs
│   ├── images
│   ├── API.md
│   ├── architecture.md
│   ├── PRD.md
│   ├── research.md
│   └── technical-spec.md
├── frontend
│   ├── public
│   ├── src
│   ├── Dockerfile
│   └── nginx.conf
├── docker-compose.yml
├── submission.json
└── .env.example
```

## Backend Design
- Express routes are organized by domain: auth, tenants, users, projects, and tasks
- Authentication middleware validates bearer tokens and injects user context
- Role checks are applied to admin-only operations
- Database migrations are stored in `backend/database/schema.sql`
- Seed data creates a demo tenant, a second tenant, and representative projects and tasks

## Frontend Design
- React Router handles public auth pages and protected application pages
- A shared layout renders dashboard, project, and user navigation
- The API service persists JWT session state and injects the bearer token automatically
- Modal forms are used for project creation, task creation, and user creation

## Docker Setup
### Start
```bash
docker compose up --build -d
```

### Stop
```bash
docker compose down
```

### Reset the database volume
```bash
docker compose down -v
docker compose up --build -d
```

## Environment Configuration
Use `.env.example` and `backend/.env.example` as the reference values. Docker Compose also includes safe defaults, so evaluators can run the project without copying committed secret files into the repository.

## Seed Accounts
- Tenant admin: `admin@demo.com` / `Admin@123` / `demo`
- Super admin: `superadmin@platform.dev` / `SuperAdmin@123`

## Verification Targets
- Backend health check responds at `GET /api/health`
- All 19 required evaluator endpoints are documented in `docs/API.md`
- The frontend supports tenant registration, login, users management, project management, and task status updates
