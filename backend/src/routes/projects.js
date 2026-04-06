const express = require("express");
const { v4: uuid } = require("uuid");

const pool = require("../config/db");
const asyncHandler = require("../utils/asyncHandler");
const { authMiddleware, requireRole } = require("../middleware/auth");
const {
  normalizePriority,
  normalizeProjectStatus,
  normalizeTaskStatus
} = require("../utils/validation");

const router = express.Router();

async function fetchProjectForTenant(projectId, tenantId) {
  const result = await pool.query(
    `
      SELECT id, tenant_id, name, description, status, created_by, created_at, updated_at
      FROM projects
      WHERE id = $1 AND tenant_id = $2
      LIMIT 1
    `,
    [projectId, tenantId]
  );

  return result.rows[0] || null;
}

router.get(
  "/",
  authMiddleware,
  asyncHandler(async (req, res) => {
    const result = await pool.query(
      `
        SELECT
          p.id,
          p.tenant_id,
          p.name,
          p.description,
          p.status,
          p.created_by,
          p.created_at,
          p.updated_at,
          COUNT(t.id)::int AS task_count,
          COUNT(t.id) FILTER (WHERE t.status = 'completed')::int AS completed_task_count
        FROM projects p
        LEFT JOIN tasks t ON t.project_id = p.id
        WHERE p.tenant_id = $1
        GROUP BY p.id
        ORDER BY p.created_at DESC, p.name ASC
      `,
      [req.user.tenantId]
    );

    res.json({
      success: true,
      data: result.rows.map((project) => ({
        id: project.id,
        tenantId: project.tenant_id,
        name: project.name,
        description: project.description,
        status: project.status,
        createdBy: project.created_by,
        createdAt: project.created_at,
        updatedAt: project.updated_at,
        taskCount: project.task_count,
        completedTaskCount: project.completed_task_count
      }))
    });
  })
);

router.post(
  "/",
  authMiddleware,
  requireRole(["tenant_admin", "super_admin"]),
  asyncHandler(async (req, res) => {
    const name = String(req.body.name || "").trim();
    const description = String(req.body.description || "").trim();
    const status = normalizeProjectStatus(req.body.status);

    if (!name) {
      return res.status(400).json({ message: "Project name is required" });
    }

    const result = await pool.query(
      `
        INSERT INTO projects (id, tenant_id, name, description, status, created_by)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id, tenant_id, name, description, status, created_by, created_at, updated_at
      `,
      [uuid(), req.user.tenantId, name, description, status, req.user.id]
    );

    res.status(201).json({
      success: true,
      data: {
        id: result.rows[0].id,
        tenantId: result.rows[0].tenant_id,
        name: result.rows[0].name,
        description: result.rows[0].description,
        status: result.rows[0].status,
        createdBy: result.rows[0].created_by,
        createdAt: result.rows[0].created_at,
        updatedAt: result.rows[0].updated_at,
        taskCount: 0,
        completedTaskCount: 0
      }
    });
  })
);

router.get(
  "/:projectId",
  authMiddleware,
  asyncHandler(async (req, res) => {
    const project = await fetchProjectForTenant(req.params.projectId, req.user.tenantId);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const tasksResult = await pool.query(
      `
        SELECT id, tenant_id, project_id, title, description, status, priority, assignee_id, created_at, updated_at
        FROM tasks
        WHERE project_id = $1
        ORDER BY created_at DESC, title ASC
      `,
      [project.id]
    );

    res.json({
      success: true,
      data: {
        id: project.id,
        tenantId: project.tenant_id,
        name: project.name,
        description: project.description,
        status: project.status,
        createdBy: project.created_by,
        createdAt: project.created_at,
        updatedAt: project.updated_at,
        tasks: tasksResult.rows.map((task) => ({
          id: task.id,
          tenantId: task.tenant_id,
          projectId: task.project_id,
          title: task.title,
          description: task.description,
          status: task.status,
          priority: task.priority,
          assigneeId: task.assignee_id,
          createdAt: task.created_at,
          updatedAt: task.updated_at
        }))
      }
    });
  })
);

router.put(
  "/:projectId",
  authMiddleware,
  requireRole(["tenant_admin", "super_admin"]),
  asyncHandler(async (req, res) => {
    const existingProject = await fetchProjectForTenant(
      req.params.projectId,
      req.user.tenantId
    );

    if (!existingProject) {
      return res.status(404).json({ message: "Project not found" });
    }

    const updates = [];
    const values = [];

    if (req.body.name && String(req.body.name).trim()) {
      values.push(String(req.body.name).trim());
      updates.push(`name = $${values.length}`);
    }

    if (typeof req.body.description === "string") {
      values.push(req.body.description.trim());
      updates.push(`description = $${values.length}`);
    }

    if (req.body.status) {
      values.push(normalizeProjectStatus(req.body.status));
      updates.push(`status = $${values.length}`);
    }

    values.push(new Date().toISOString());
    updates.push(`updated_at = $${values.length}`);

    if (updates.length === 1) {
      return res.status(400).json({ message: "No valid project fields were provided" });
    }

    values.push(req.params.projectId);
    values.push(req.user.tenantId);

    const result = await pool.query(
      `
        UPDATE projects
        SET ${updates.join(", ")}
        WHERE id = $${values.length - 1} AND tenant_id = $${values.length}
        RETURNING id, tenant_id, name, description, status, created_by, created_at, updated_at
      `,
      values
    );

    res.json({
      success: true,
      data: {
        id: result.rows[0].id,
        tenantId: result.rows[0].tenant_id,
        name: result.rows[0].name,
        description: result.rows[0].description,
        status: result.rows[0].status,
        createdBy: result.rows[0].created_by,
        createdAt: result.rows[0].created_at,
        updatedAt: result.rows[0].updated_at
      }
    });
  })
);

router.delete(
  "/:projectId",
  authMiddleware,
  requireRole(["tenant_admin", "super_admin"]),
  asyncHandler(async (req, res) => {
    const existingProject = await fetchProjectForTenant(
      req.params.projectId,
      req.user.tenantId
    );

    if (!existingProject) {
      return res.status(404).json({ message: "Project not found" });
    }

    await pool.withTransaction(async (client) => {
      await client.query("DELETE FROM tasks WHERE project_id = $1", [req.params.projectId]);
      await client.query("DELETE FROM projects WHERE id = $1", [req.params.projectId]);
    });

    res.json({ success: true, message: "Project deleted successfully" });
  })
);

router.get(
  "/:projectId/tasks",
  authMiddleware,
  asyncHandler(async (req, res) => {
    const project = await fetchProjectForTenant(req.params.projectId, req.user.tenantId);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const result = await pool.query(
      `
        SELECT id, tenant_id, project_id, title, description, status, priority, assignee_id, created_at, updated_at
        FROM tasks
        WHERE project_id = $1
        ORDER BY created_at DESC, title ASC
      `,
      [req.params.projectId]
    );

    res.json({
      success: true,
      data: result.rows.map((task) => ({
        id: task.id,
        tenantId: task.tenant_id,
        projectId: task.project_id,
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        assigneeId: task.assignee_id,
        createdAt: task.created_at,
        updatedAt: task.updated_at
      }))
    });
  })
);

router.post(
  "/:projectId/tasks",
  authMiddleware,
  requireRole(["tenant_admin", "super_admin"]),
  asyncHandler(async (req, res) => {
    const project = await fetchProjectForTenant(req.params.projectId, req.user.tenantId);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const title = String(req.body.title || "").trim();
    const description = String(req.body.description || "").trim();
    const status = normalizeTaskStatus(req.body.status);
    const priority = normalizePriority(req.body.priority);
    const assigneeId = req.body.assigneeId || null;

    if (!title) {
      return res.status(400).json({ message: "Task title is required" });
    }

    const result = await pool.query(
      `
        INSERT INTO tasks (id, tenant_id, project_id, title, description, status, priority, assignee_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING id, tenant_id, project_id, title, description, status, priority, assignee_id, created_at, updated_at
      `,
      [uuid(), project.tenant_id, project.id, title, description, status, priority, assigneeId]
    );

    res.status(201).json({
      success: true,
      data: {
        id: result.rows[0].id,
        tenantId: result.rows[0].tenant_id,
        projectId: result.rows[0].project_id,
        title: result.rows[0].title,
        description: result.rows[0].description,
        status: result.rows[0].status,
        priority: result.rows[0].priority,
        assigneeId: result.rows[0].assignee_id,
        createdAt: result.rows[0].created_at,
        updatedAt: result.rows[0].updated_at
      }
    });
  })
);

module.exports = router;
