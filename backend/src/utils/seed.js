const pool = require("../config/db");
const bcrypt = require("bcrypt");
const { v4: uuid } = require("uuid");

async function seedDatabase() {
  const tenantId = uuid();
  const adminPassword = await bcrypt.hash("Admin@123", 10);

  const exists = await pool.query("SELECT 1 FROM tenants LIMIT 1");
  if (exists.rowCount > 0) {
    console.log("ℹ️ Seed already exists");
    return;
  }

  await pool.query(
    "INSERT INTO tenants VALUES ($1,$2,$3)",
    [tenantId, "Demo Tenant", "demo"]
  );

  await pool.query(
    "INSERT INTO users VALUES ($1,$2,$3,$4,$5)",
    [uuid(), "admin@demo.com", adminPassword, "tenant_admin", tenantId]
  );

  const projectId = uuid();

  await pool.query(
    "INSERT INTO projects VALUES ($1,$2,$3)",
    [projectId, "Demo Project", tenantId]
  );

  await pool.query(
    "INSERT INTO tasks VALUES ($1,$2,$3,$4,$5)",
    [uuid(), "Initial Task", "completed", projectId, tenantId]
  );

  console.log("Seed data loaded");
}

module.exports = { seedDatabase };
