# Multi-Tenant SaaS Platform

A fully dockerized, multi-tenant SaaS application built with **Node.js, Express, PostgreSQL, and React**.  
The system supports **authentication, role-based access control (RBAC), tenant data isolation, automatic database initialization, and seed data loading**, all runnable with a single Docker command.

---

## Features

- Multi-tenant architecture with strict tenant data isolation
- JWT-based authentication and authorization
- Password hashing using bcrypt
- Role-Based Access Control (Super Admin, Tenant Admin, User)
- Project and task management per tenant
- Fully dockerized (database, backend, frontend)
- Automatic database migrations and seed data loading
- Health check endpoint for evaluation
- Persistent database storage using Docker volumes
- Production-ready frontend served via Nginx

---

## System Architecture

**Frontend**
- React application
- Protected routes using JWT
- Role-based UI rendering

**Backend**
- Node.js + Express
- JWT authentication
- bcrypt password hashing
- Tenant isolation enforced at query level

**Database**
- PostgreSQL
- Automatic migrations and seed data
- Persistent Docker volume

---

## Dockerized Setup (MANDATORY)

### Prerequisites
- Docker
- Docker Compose

### Start the Application
```bash
docker-compose up -d
```

This command will:
- Start PostgreSQL database
- Run backend migrations automatically
- Load seed data automatically
- Start backend API server
- Build and serve frontend application

### Stop the Application
```bash
docker-compose down
```

### Reset Database (if needed)
```bash
docker-compose down -v
docker-compose up -d
```

---

## Service Ports

| Service  | External Port | Internal Port |
| -------- | ------------- | ------------- |
| Database | 5432          | 5432          |
| Backend  | 5000          | 5000          |
| Frontend | 3000          | 3000          |

---

## Authentication & Seed Credentials

All seed data is **automatically loaded** at startup.

### Tenant Admin (Seeded)
```
Email: admin@demo.com
Password: Admin@123
```

Use these credentials to log in via:
```
http://localhost:3000/login
```

---

## Health Check Endpoint

Used for automated evaluation:
```http
GET http://localhost:5000/api/health
```

Response:
```json
{
  "status": "ok",
  "database": "connected"
}
```

---

## API Documentation

Complete API documentation is available at:
```
docs/API.md
```

All protected endpoints require:
```
Authorization: Bearer <JWT_TOKEN>
```

---

## Project Structure
```
.
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── utils/
│   │   ├── config/
│   │   └── server.js
│   ├── Dockerfile
│   └── .env
├── frontend/
│   ├── src/
│   └── Dockerfile
├── docs/
│   ├── API.md
│   ├── architecture.md
│   ├── PRD.md
│   ├── research.md
│   ├── technical-spec.md
│   └── images/
├── docker-compose.yml
├── submission.json
└── README.md
```

---

## Testing the Application

1. Run `docker-compose up -d`
2. Open browser: [http://localhost:3000/login](http://localhost:3000/login)
3. Login using seeded credentials
4. Verify:
   - Dashboard shows real data
   - Projects list is visible
   - Users list is visible
   - Tenant isolation is enforced

---

## Security Highlights

- Passwords hashed using bcrypt
- JWT-based stateless authentication
- Tenant isolation enforced at database query level
- Role-based authorization middleware
- SQL injection prevention using parameterized queries
- Environment variables used for secrets

---

## Documentation

| Document                | Location               |
| ----------------------- | ---------------------- |
| API Documentation       | docs/API.md            |
| Architecture            | docs/architecture.md   |
| Product Requirements    | docs/PRD.md            |
| Research & Analysis     | docs/research.md       |
| Technical Specification | docs/technical-spec.md |

---

## Evaluation Checklist

- [x] Dockerized application (3 services)
- [x] Fixed port mappings
- [x] Automatic DB migrations
- [x] Automatic seed data loading
- [x] JWT authentication
- [x] Password hashing
- [x] Tenant isolation
- [x] Role-based access control
- [x] Health check endpoint
- [x] Complete documentation

---

## Conclusion

This project demonstrates a **production-ready multi-tenant SaaS architecture** with strong emphasis on security, scalability, and reproducibility using Docker.