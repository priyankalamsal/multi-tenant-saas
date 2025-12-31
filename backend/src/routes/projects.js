const express = require("express");
const pool = require("../config/db");
const { authMiddleware } = require("../middleware/auth");
const { v4: uuid } = require("uuid");

const router = express.Router();

router.get("/", authMiddleware, async (req, res) => {
  const result = await pool.query(
    "SELECT * FROM projects WHERE tenant_id=$1",
    [req.user.tenantId]
  );

  res.json({ success: true, data: result.rows });
});

router.post("/", authMiddleware, async (req, res) => {
  const { name } = req.body;

  await pool.query(
    "INSERT INTO projects VALUES ($1,$2,$3)",
    [uuid(), name, req.user.tenantId]
  );

  res.json({ success: true });
});

module.exports = router;
