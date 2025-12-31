# System Architecture

## Overview
The Multi-Tenant SaaS Platform is a Dockerized web application designed with strict tenant isolation, authentication, and role-based access control.

---

## Components

### Frontend
- React application
- Communicates with backend via REST APIs
- JWT stored in browser localStorage
- Role-based UI rendering

### Backend
- Node.js + Express
- JWT authentication
- bcrypt password hashing
- Tenant isolation enforced at query level

### Database
- PostgreSQL
- Persistent Docker volume
- Seed data auto-loaded at startup

---

## Docker Architecture

All services run using docker-compose:

- database (PostgreSQL)
- backend (API server)
- frontend (React + Nginx)

Single command startup:
docker-compose up -d

---

## Database ERD
Entities:
- tenants
- users
- projects
- tasks

Relationships:
- One tenant → many users
- One tenant → many projects
- One project → many tasks
