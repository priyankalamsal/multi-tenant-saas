const fs = require("fs/promises");
const path = require("path");

const pool = require("../config/db");

async function runMigrations() {
  const schemaPath = path.join(__dirname, "../../database/schema.sql");
  const schemaSql = await fs.readFile(schemaPath, "utf8");

  await pool.query(schemaSql);

  console.log("Migrations complete");
}

module.exports = { runMigrations };
