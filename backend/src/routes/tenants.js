const express = require("express");
const bcrypt = require("bcrypt");
const { v4: uuid } = require("uuid");

const pool = require("../config/db");
const asyncHandler = require("../utils/asyncHandler");
const { authMiddleware, canAccessTenant, requireRole } = require("../middleware/auth");
const { serializeTenant, serializeUser } = require("../utils/auth");
const {
  isValidEmail,
  isValidPassword,
  normalizeEmail,
  normalizeRole,
  normalizeSubdomain,
  validateRequiredFields
} = require("../utils/validation");

const router = express.Router();

function tenantAccessDenied(req, res, tenantId) {
  if (!canAccessTenant(req.user, tenantId)) {
    res.status(403).json({ message: "You do not have access to this tenant" });
    return true;
  }

  return false;
}

router.get(
  "/",
  authMiddleware,
  asyncHandler(async (req, res) => {
    const filters = [];
    const values = [];

    if (req.user.role !== "super_admin") {
      values.push(req.user.tenantId);
      filters.push(`t.id = $${values.length}`);
    }

    const whereClause = filters.length > 0 ? `WHERE ${filters.join(" AND ")}` : "";

    const result = await pool.query(
      `
        SELECT
          t.id,
          t.name,
          t.subdomain,
          t.status,
          t.created_at,
          t.updated_at,
          COUNT(DISTINCT u.id)::int AS user_count,
          COUNT(DISTINCT p.id)::int AS project_count,
          COUNT(DISTINCT tk.id)::int AS task_count
        FROM tenants t
        LEFT JOIN users u ON u.tenant_id = t.id
        LEFT JOIN projects p ON p.tenant_id = t.id
        LEFT JOIN tasks tk ON tk.tenant_id = t.id
        ${whereClause}
        GROUP BY t.id
        ORDER BY t.created_at ASC, t.name ASC
      `,
      values
    );

    res.json({
      success: true,
      data: result.rows.map((tenant) => ({
        ...serializeTenant(tenant),
        createdAt: tenant.created_at,
        updatedAt: tenant.updated_at,
        stats: {
          users: tenant.user_count,
          projects: tenant.project_count,
          tasks: tenant.task_count
        }
      }))
    });
  })
);

router.get(
  "/:tenantId/users",
  authMiddleware,
  requireRole(["tenant_admin", "super_admin"]),
  asyncHandler(async (req, res) => {
    const { tenantId } = req.params;

    if (tenantAccessDenied(req, res, tenantId)) {
      return;
    }

    const result = await pool.query(
      `
        SELECT id, full_name, email, role, tenant_id, is_active, created_at, updated_at
        FROM users
        WHERE tenant_id = $1
        ORDER BY created_at ASC, email ASC
      `,
      [tenantId]
    );

    res.json({
      success: true,
      data: result.rows.map((user) => ({
        ...serializeUser(user),
        createdAt: user.created_at,
        updatedAt: user.updated_at
      }))
    });
  })
);

router.post(
  "/:tenantId/users",
  authMiddleware,
  requireRole(["tenant_admin", "super_admin"]),
  asyncHandler(async (req, res) => {
    const { tenantId } = req.params;

    if (tenantAccessDenied(req, res, tenantId)) {
      return;
    }

    const fullName = String(req.body.fullName || req.body.name || "").trim();
    const email = normalizeEmail(req.body.email);
    const password = req.body.password;
    const role = normalizeRole(req.body.role || "user");

    const missingFields = validateRequiredFields({
      fullName,
      email,
      password
    });

    if (missingFields.length > 0) {
      return res.status(400).json({
        message: `Missing required fields: ${missingFields.join(", ")}`
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: "Please provide a valid email address" });
    }

    if (!isValidPassword(password)) {
      return res.status(400).json({
        message: "Password must be at least 8 characters long"
      });
    }

    if (role === "super_admin" && req.user.role !== "super_admin") {
      return res.status(403).json({
        message: "Only super admins can create super admin users"
      });
    }

    const tenantResult = await pool.query(
      "SELECT id FROM tenants WHERE id = $1",
      [tenantId]
    );

    if (tenantResult.rowCount === 0) {
      return res.status(404).json({ message: "Tenant not found" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    try {
      const result = await pool.query(
        `
          INSERT INTO users (id, full_name, email, password, role, tenant_id, is_active)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
          RETURNING id, full_name, email, role, tenant_id, is_active, created_at, updated_at
        `,
        [uuid(), fullName, email, passwordHash, role, tenantId, true]
      );

      res.status(201).json({
        success: true,
        data: {
          ...serializeUser(result.rows[0]),
          createdAt: result.rows[0].created_at,
          updatedAt: result.rows[0].updated_at
        }
      });
    } catch (error) {
      if (error.code === "23505") {
        return res.status(409).json({ message: "A user with this email already exists" });
      }

      throw error;
    }
  })
);

router.get(
  "/:tenantId",
  authMiddleware,
  asyncHandler(async (req, res) => {
    const { tenantId } = req.params;

    if (tenantAccessDenied(req, res, tenantId)) {
      return;
    }

    const result = await pool.query(
      `
        SELECT
          t.id,
          t.name,
          t.subdomain,
          t.status,
          t.created_at,
          t.updated_at,
          COUNT(DISTINCT u.id)::int AS user_count,
          COUNT(DISTINCT p.id)::int AS project_count,
          COUNT(DISTINCT tk.id)::int AS task_count
        FROM tenants t
        LEFT JOIN users u ON u.tenant_id = t.id
        LEFT JOIN projects p ON p.tenant_id = t.id
        LEFT JOIN tasks tk ON tk.tenant_id = t.id
        WHERE t.id = $1
        GROUP BY t.id
      `,
      [tenantId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Tenant not found" });
    }

    const tenant = result.rows[0];

    res.json({
      success: true,
      data: {
        ...serializeTenant(tenant),
        createdAt: tenant.created_at,
        updatedAt: tenant.updated_at,
        stats: {
          users: tenant.user_count,
          projects: tenant.project_count,
          tasks: tenant.task_count
        }
      }
    });
  })
);

router.put(
  "/:tenantId",
  authMiddleware,
  requireRole(["tenant_admin", "super_admin"]),
  asyncHandler(async (req, res) => {
    const { tenantId } = req.params;

    if (tenantAccessDenied(req, res, tenantId)) {
      return;
    }

    const updates = [];
    const values = [];

    if (req.body.name && String(req.body.name).trim()) {
      values.push(String(req.body.name).trim());
      updates.push(`name = $${values.length}`);
    }

    if (req.body.subdomain && String(req.body.subdomain).trim()) {
      values.push(normalizeSubdomain(req.body.subdomain));
      updates.push(`subdomain = $${values.length}`);
    }

    if (req.body.status && String(req.body.status).trim()) {
      values.push(String(req.body.status).trim().toLowerCase());
      updates.push(`status = $${values.length}`);
    }

    values.push(new Date().toISOString());
    updates.push(`updated_at = $${values.length}`);

    if (updates.length === 1) {
      return res.status(400).json({ message: "No valid tenant fields were provided" });
    }

    values.push(tenantId);

    try {
      const result = await pool.query(
        `
          UPDATE tenants
          SET ${updates.join(", ")}
          WHERE id = $${values.length}
          RETURNING id, name, subdomain, status, created_at, updated_at
        `,
        values
      );

      if (result.rowCount === 0) {
        return res.status(404).json({ message: "Tenant not found" });
      }

      res.json({
        success: true,
        data: {
          ...serializeTenant(result.rows[0]),
          createdAt: result.rows[0].created_at,
          updatedAt: result.rows[0].updated_at
        }
      });
    } catch (error) {
      if (error.code === "23505") {
        return res.status(409).json({ message: "This subdomain is already in use" });
      }

      throw error;
    }
  })
);

module.exports = router;
