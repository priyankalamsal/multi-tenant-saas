# API Documentation – Multi-Tenant SaaS Platform

Base URL:
http://localhost:5000/api

All protected endpoints require:
Authorization: Bearer <JWT_TOKEN>

---

## Authentication

### POST /auth/login
Login using seeded credentials.

Request:
{
  "email": "admin@demo.com",
  "password": "Admin@123"
}

Response:
{
  "success": true,
  "token": "<jwt-token>",
  "user": {
    "id": "uuid",
    "email": "admin@demo.com",
    "role": "tenant_admin"
  }
}

---

## Users (Tenant Admin Only)

### GET /users
Returns all users belonging to the authenticated tenant.

Response:
{
  "success": true,
  "data": [
    { "id": "uuid", "email": "admin@demo.com", "role": "tenant_admin" }
  ]
}

---

## Projects

### GET /projects
Returns all projects for authenticated tenant.

### POST /projects
Creates a new project.

Request:
{
  "name": "New Project"
}

---

## Tasks

### GET /tasks
Returns all tasks for authenticated tenant.

### POST /tasks
Creates a new task.

Request:
{
  "title": "Task Name",
  "status": "completed",
  "projectId": "uuid"
}

---

## Health Check

### GET /health
Returns application health.

Response:
{
  "status": "ok",
  "database": "connected"
}
