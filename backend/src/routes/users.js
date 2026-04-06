const express = require("express");
const bcrypt = require("bcrypt");

const pool = require("../config/db");
const asyncHandler = require("../utils/asyncHandler");
const { serializeUser } = require("../utils/auth");
const { authMiddleware, requireRole } = require("../middleware/auth");
const {
  isValidEmail,
  isValidPassword,
  normalizeEmail,
  normalizeRole
} = require("../utils/validation");

const router = express.Router();

router.get(
  "/",
  authMiddleware,
  requireRole(["tenant_admin", "super_admin"]),
  asyncHandler(async (req, res) => {
    const result = await pool.query(
      `
        SELECT id, full_name, email, role, tenant_id, is_active, created_at, updated_at
        FROM users
        WHERE tenant_id = $1
        ORDER BY created_at ASC, email ASC
      `,
      [req.user.tenantId]
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

router.put(
  "/:userId",
  authMiddleware,
  requireRole(["tenant_admin", "super_admin"]),
  asyncHandler(async (req, res) => {
    const { userId } = req.params;

    const existingResult = await pool.query(
      `
        SELECT id, full_name, email, role, tenant_id, is_active
        FROM users
        WHERE id = $1
        LIMIT 1
      `,
      [userId]
    );

    if (existingResult.rowCount === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const existingUser = existingResult.rows[0];
    const sameTenant = existingUser.tenant_id === req.user.tenantId;

    if (req.user.role !== "super_admin" && !sameTenant) {
      return res.status(403).json({ message: "You do not have access to this user" });
    }

    const nextEmail = req.body.email ? normalizeEmail(req.body.email) : "";
    const nextFullName = req.body.fullName ? String(req.body.fullName).trim() : "";
    const nextRole = req.body.role ? normalizeRole(req.body.role) : "";
    const nextPassword = req.body.password;
    const nextIsActive =
      typeof req.body.isActive === "boolean" ? req.body.isActive : null;

    if (nextEmail && !isValidEmail(nextEmail)) {
      return res.status(400).json({ message: "Please provide a valid email address" });
    }

    if (nextPassword && !isValidPassword(nextPassword)) {
      return res.status(400).json({
        message: "Password must be at least 8 characters long"
      });
    }

    if (nextRole === "super_admin" && req.user.role !== "super_admin") {
      return res.status(403).json({
        message: "Only super admins can promote users to super admin"
      });
    }

    const updates = [];
    const values = [];

    if (nextFullName) {
      values.push(nextFullName);
      updates.push(`full_name = $${values.length}`);
    }

    if (nextEmail) {
      values.push(nextEmail);
      updates.push(`email = $${values.length}`);
    }

    if (nextRole) {
      values.push(nextRole);
      updates.push(`role = $${values.length}`);
    }

    if (nextIsActive !== null) {
      values.push(nextIsActive);
      updates.push(`is_active = $${values.length}`);
    }

    if (nextPassword) {
      const passwordHash = await bcrypt.hash(nextPassword, 10);
      values.push(passwordHash);
      updates.push(`password = $${values.length}`);
    }

    values.push(new Date().toISOString());
    updates.push(`updated_at = $${values.length}`);

    if (updates.length === 1) {
      return res.status(400).json({ message: "No valid user fields were provided" });
    }

    values.push(userId);

    try {
      const result = await pool.query(
        `
          UPDATE users
          SET ${updates.join(", ")}
          WHERE id = $${values.length}
          RETURNING id, full_name, email, role, tenant_id, is_active, created_at, updated_at
        `,
        values
      );

      res.json({
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

router.delete(
  "/:userId",
  authMiddleware,
  requireRole(["tenant_admin", "super_admin"]),
  asyncHandler(async (req, res) => {
    const { userId } = req.params;

    const existingResult = await pool.query(
      "SELECT id, tenant_id FROM users WHERE id = $1 LIMIT 1",
      [userId]
    );

    if (existingResult.rowCount === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const existingUser = existingResult.rows[0];
    const sameTenant = existingUser.tenant_id === req.user.tenantId;

    if (req.user.role !== "super_admin" && !sameTenant) {
      return res.status(403).json({ message: "You do not have access to this user" });
    }

    await pool.query("DELETE FROM users WHERE id = $1", [userId]);

    res.json({ success: true, message: "User deleted successfully" });
  })
);

module.exports = router;
