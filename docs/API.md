# API Reference

Base URL: `http://localhost:5000/api`

Protected routes require:

```http
Authorization: Bearer <JWT_TOKEN>
```

## Authentication

### POST `/auth/register-tenant`
Creates a tenant and its first tenant admin.

Request body:
```json
{
  "tenantName": "Northwind Labs",
  "subdomain": "northwind",
  "adminFullName": "Nina Tenant",
  "adminEmail": "nina@northwind.com",
  "adminPassword": "Admin@123"
}
```

### POST `/auth/login`
Authenticates a user with tenant context.

Request body:
```json
{
  "email": "admin@demo.com",
  "password": "Admin@123",
  "subdomain": "demo"
}
```

### GET `/auth/me`
Returns the authenticated user and tenant metadata.

### POST `/auth/logout`
Returns a success response for client-side session cleanup.

## Tenant Management

### GET `/tenants`
Returns all tenants visible to the authenticated user.

### GET `/tenants/:tenantId`
Returns a tenant summary with aggregate counts.

### PUT `/tenants/:tenantId`
Updates tenant name, subdomain, or status.

Request body example:
```json
{
  "name": "Demo Tenant",
  "subdomain": "demo",
  "status": "active"
}
```

## User Management

### POST `/tenants/:tenantId/users`
Creates a user inside a tenant.

Request body:
```json
{
  "fullName": "Alex Member",
  "email": "alex@demo.com",
  "password": "Admin@123",
  "role": "user"
}
```

### GET `/tenants/:tenantId/users`
Lists users for the target tenant.

### GET `/users`
Lists users for the signed-in tenant.

### PUT `/users/:userId`
Updates a tenant user.

Request body example:
```json
{
  "fullName": "Alex Updated",
  "role": "tenant_admin",
  "isActive": true
}
```

### DELETE `/users/:userId`
Deletes the target user.

## Project Management

### GET `/projects`
Lists tenant projects with task counts.

### POST `/projects`
Creates a project.

Request body:
```json
{
  "name": "Demo Launch Plan",
  "description": "Coordinate tenant rollout work.",
  "status": "active"
}
```

### GET `/projects/:projectId`
Returns a project with nested tasks.

### PUT `/projects/:projectId`
Updates project details.

### DELETE `/projects/:projectId`
Deletes a project and its tasks.

## Task Management

### POST `/projects/:projectId/tasks`
Creates a task under a project.

Request body:
```json
{
  "title": "Prepare onboarding checklist",
  "description": "Collect the first-run steps.",
  "status": "todo",
  "priority": "high",
  "assigneeId": "optional-user-id"
}
```

### GET `/projects/:projectId/tasks`
Lists tasks for a project.

### GET `/tasks`
Lists tenant tasks across projects.

### PATCH `/tasks/:taskId/status`
Updates only the task status.

Request body:
```json
{
  "status": "completed"
}
```

### PUT `/tasks/:taskId`
Updates task metadata.

Request body example:
```json
{
  "title": "Updated task title",
  "description": "Updated details",
  "status": "in_progress",
  "priority": "medium"
}
```

## Health Check

### GET `/health`
Returns application and database status.

Response:
```json
{
  "status": "ok",
  "database": "connected"
}
```
