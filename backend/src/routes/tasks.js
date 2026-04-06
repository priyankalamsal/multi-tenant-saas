const express = require("express");

const pool = require("../config/db");
const { authMiddleware } = require("../middleware/auth");
const asyncHandler = require("../utils/asyncHandler");
const { normalizePriority, normalizeTaskStatus } = require("../utils/validation");

const router = express.Router();

router.get(
  "/",
  authMiddleware,
  asyncHandler(async (req, res) => {
    const result = await pool.query(
      `
        SELECT
          t.id,
          t.tenant_id,
          t.project_id,
          t.title,
          t.description,
          t.status,
          t.priority,
          t.assignee_id,
          t.created_at,
          t.updated_at,
          p.name AS project_name
        FROM tasks t
        LEFT JOIN projects p ON p.id = t.project_id
        WHERE t.tenant_id = $1
        ORDER BY t.created_at DESC, t.title ASC
      `,
      [req.user.tenantId]
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
        projectName: task.project_name,
        createdAt: task.created_at,
        updatedAt: task.updated_at
      }))
    });
  })
);

router.patch(
  "/:taskId/status",
  authMiddleware,
  asyncHandler(async (req, res) => {
    const status = normalizeTaskStatus(req.body.status);

    const result = await pool.query(
      `
        UPDATE tasks
        SET status = $1, updated_at = $2
        WHERE id = $3 AND tenant_id = $4
        RETURNING id, tenant_id, project_id, title, description, status, priority, assignee_id, created_at, updated_at
      `,
      [status, new Date().toISOString(), req.params.taskId, req.user.tenantId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json({
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

router.put(
  "/:taskId",
  authMiddleware,
  asyncHandler(async (req, res) => {
    const existingTask = await pool.query(
      `
        SELECT id, tenant_id
        FROM tasks
        WHERE id = $1 AND tenant_id = $2
        LIMIT 1
      `,
      [req.params.taskId, req.user.tenantId]
    );

    if (existingTask.rowCount === 0) {
      return res.status(404).json({ message: "Task not found" });
    }

    const updates = [];
    const values = [];

    if (req.body.title && String(req.body.title).trim()) {
      values.push(String(req.body.title).trim());
      updates.push(`title = $${values.length}`);
    }

    if (typeof req.body.description === "string") {
      values.push(req.body.description.trim());
      updates.push(`description = $${values.length}`);
    }

    if (req.body.status) {
      values.push(normalizeTaskStatus(req.body.status));
      updates.push(`status = $${values.length}`);
    }

    if (req.body.priority) {
      values.push(normalizePriority(req.body.priority));
      updates.push(`priority = $${values.length}`);
    }

    if (Object.prototype.hasOwnProperty.call(req.body, "assigneeId")) {
      values.push(req.body.assigneeId || null);
      updates.push(`assignee_id = $${values.length}`);
    }

    values.push(new Date().toISOString());
    updates.push(`updated_at = $${values.length}`);

    if (updates.length === 1) {
      return res.status(400).json({ message: "No valid task fields were provided" });
    }

    values.push(req.params.taskId);
    values.push(req.user.tenantId);

    const result = await pool.query(
      `
        UPDATE tasks
        SET ${updates.join(", ")}
        WHERE id = $${values.length - 1} AND tenant_id = $${values.length}
        RETURNING id, tenant_id, project_id, title, description, status, priority, assignee_id, created_at, updated_at
      `,
      values
    );

    res.json({
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
