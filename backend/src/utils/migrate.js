const pool = require("../config/db");

async function runMigrations() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS tenants (
      id UUID PRIMARY KEY,
      name TEXT,
      subdomain TEXT UNIQUE
    );

    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY,
      email TEXT UNIQUE,
      password TEXT,
      role TEXT,
      tenant_id UUID REFERENCES tenants(id)
    );

    CREATE TABLE IF NOT EXISTS projects (
      id UUID PRIMARY KEY,
      name TEXT,
      tenant_id UUID REFERENCES tenants(id)
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id UUID PRIMARY KEY,
      title TEXT,
      status TEXT,
      project_id UUID REFERENCES projects(id),
      tenant_id UUID REFERENCES tenants(id)
    );
  `);

  console.log("Migrations complete");
}

module.exports = { runMigrations };
