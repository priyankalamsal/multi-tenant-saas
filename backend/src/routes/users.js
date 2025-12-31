const express = require("express");
const pool = require("../config/db");
const { authMiddleware, requireRole } = require("../middleware/auth");

const router = express.Router();

router.get(
  "/",
  authMiddleware,
  requireRole(["tenant_admin", "super_admin"]),
  async (req, res) => {
    const result = await pool.query(
      "SELECT id,email,role FROM users WHERE tenant_id=$1",
      [req.user.tenantId]
    );

    res.json({ success: true, data: result.rows });
  }
);

module.exports = router;
