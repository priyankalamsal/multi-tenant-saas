const express = require("express");
const bcrypt = require("bcrypt");
const { v4: uuid } = require("uuid");

const pool = require("../config/db");
const { authMiddleware } = require("../middleware/auth");
const asyncHandler = require("../utils/asyncHandler");
const { serializeTenant, serializeUser, signToken } = require("../utils/auth");
const {
  isValidEmail,
  isValidPassword,
  isValidSubdomain,
  normalizeEmail,
  normalizeSubdomain,
  validateRequiredFields
} = require("../utils/validation");

const router = express.Router();

router.post(
  "/register-tenant",
  asyncHandler(async (req, res) => {
    const tenantName = String(req.body.tenantName || req.body.name || "").trim();
    const subdomain = normalizeSubdomain(req.body.subdomain);
    const adminFullName = String(
      req.body.adminFullName || req.body.adminName || req.body.fullName || ""
    ).trim();
    const adminEmail = normalizeEmail(req.body.adminEmail || req.body.email);
    const adminPassword = req.body.adminPassword || req.body.password;

    const missingFields = validateRequiredFields({
      tenantName,
      subdomain,
      adminFullName,
      adminEmail,
      adminPassword
    });

    if (missingFields.length > 0) {
      return res.status(400).json({
        message: `Missing required fields: ${missingFields.join(", ")}`
      });
    }

    if (!isValidSubdomain(subdomain)) {
      return res.status(400).json({
        message: "Subdomain can only contain lowercase letters, numbers, and hyphens"
      });
    }

    if (!isValidEmail(adminEmail)) {
      return res.status(400).json({ message: "Please provide a valid admin email address" });
    }

    if (!isValidPassword(adminPassword)) {
      return res.status(400).json({
        message: "Admin password must be at least 8 characters long"
      });
    }

    const existingTenant = await pool.query(
      "SELECT id FROM tenants WHERE subdomain = $1",
      [subdomain]
    );

    if (existingTenant.rowCount > 0) {
      return res.status(409).json({ message: "This subdomain is already in use" });
    }

    const existingUser = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [adminEmail]
    );

    if (existingUser.rowCount > 0) {
      return res.status(409).json({ message: "A user with this email already exists" });
    }

    const passwordHash = await bcrypt.hash(adminPassword, 10);

    const payload = await pool.withTransaction(async (client) => {
      const tenantResult = await client.query(
        `
          INSERT INTO tenants (id, name, subdomain, status)
          VALUES ($1, $2, $3, $4)
          RETURNING id, name, subdomain, status, created_at, updated_at
        `,
        [uuid(), tenantName, subdomain, "active"]
      );

      const userResult = await client.query(
        `
          INSERT INTO users (id, full_name, email, password, role, tenant_id, is_active)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
          RETURNING id, full_name, email, role, tenant_id, is_active, created_at, updated_at
        `,
        [
          uuid(),
          adminFullName,
          adminEmail,
          passwordHash,
          "tenant_admin",
          tenantResult.rows[0].id,
          true
        ]
      );

      return {
        tenant: tenantResult.rows[0],
        user: userResult.rows[0]
      };
    });

    const token = signToken(payload.user);

    res.status(201).json({
      success: true,
      message: "Tenant registered successfully",
      token,
      tenant: {
        ...serializeTenant(payload.tenant),
        createdAt: payload.tenant.created_at,
        updatedAt: payload.tenant.updated_at
      },
      user: {
        ...serializeUser(payload.user),
        createdAt: payload.user.created_at,
        updatedAt: payload.user.updated_at
      }
    });
  })
);

router.post(
  "/login",
  asyncHandler(async (req, res) => {
    const email = normalizeEmail(req.body.email);
    const password = req.body.password;
    const subdomain = normalizeSubdomain(req.body.subdomain || req.body.tenantSubdomain);

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const values = [email];
    let tenantFilter = "";

    if (subdomain) {
      values.push(subdomain);
      tenantFilter = `AND LOWER(COALESCE(t.subdomain, '')) = LOWER($${values.length})`;
    }

    const result = await pool.query(
      `
        SELECT
          u.id,
          u.full_name,
          u.email,
          u.password,
          u.role,
          u.tenant_id,
          u.is_active,
          u.created_at,
          u.updated_at,
          t.name,
          t.subdomain,
          t.status
        FROM users u
        LEFT JOIN tenants t ON t.id = u.tenant_id
        WHERE LOWER(u.email) = LOWER($1)
          ${tenantFilter}
        LIMIT 1
      `,
      values
    );

    if (result.rowCount === 0) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const user = result.rows[0];

    if (user.is_active === false) {
      return res.status(403).json({ message: "Your account is inactive" });
    }

    const passwordMatches = await bcrypt.compare(password, user.password);

    if (!passwordMatches) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = signToken(user);

    res.json({
      success: true,
      token,
      user: {
        ...serializeUser(user),
        createdAt: user.created_at,
        updatedAt: user.updated_at
      },
      tenant: serializeTenant(user)
    });
  })
);

router.get(
  "/me",
  authMiddleware,
  asyncHandler(async (req, res) => {
    const result = await pool.query(
      `
        SELECT
          u.id,
          u.full_name,
          u.email,
          u.role,
          u.tenant_id,
          u.is_active,
          u.created_at,
          u.updated_at,
          t.name,
          t.subdomain,
          t.status
        FROM users u
        LEFT JOIN tenants t ON t.id = u.tenant_id
        WHERE u.id = $1
        LIMIT 1
      `,
      [req.user.id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = result.rows[0];

    res.json({
      success: true,
      user: {
        ...serializeUser(user),
        createdAt: user.created_at,
        updatedAt: user.updated_at
      },
      tenant: serializeTenant(user)
    });
  })
);

router.post("/logout", authMiddleware, (req, res) => {
  res.json({ success: true, message: "Logout successful" });
});

module.exports = router;
