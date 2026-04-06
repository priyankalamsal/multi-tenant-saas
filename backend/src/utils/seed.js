const bcrypt = require("bcrypt");

const pool = require("../config/db");

const DEMO_TENANT_ID = "81da4e51-2b90-449c-acf6-d0b7092f4e85";
const ACME_TENANT_ID = "27f520a2-f2f2-4bf9-a85f-e2f515f79863";
const SUPER_ADMIN_ID = "f654ae42-2088-4ee4-b535-95c465245f87";
const DEMO_ADMIN_ID = "96e61d1d-2146-4698-a8f3-ef22d2727a14";
const DEMO_MEMBER_ID = "d51822e4-305d-4f34-aa44-df4ddcb31d8f";
const ACME_ADMIN_ID = "0f8c9044-c881-4931-9b26-e89bb64abd5c";
const DEMO_PROJECT_ID = "4ef4ce42-df3e-4a53-9168-44f3182ca67b";
const ACME_PROJECT_ID = "59c64084-b6ef-4f43-8403-490e84a0bb50";
const DEMO_TASK_ONE_ID = "553e3de8-2f63-4e36-8995-ef1f6df5d772";
const DEMO_TASK_TWO_ID = "8eff0cd8-f6b4-4fb3-a886-986d8e4af0cf";
const ACME_TASK_ID = "4a2bb944-a438-4d35-86c3-c6fe3e4aa4b9";

async function upsertUser(client, user) {
  await client.query(
    `
      INSERT INTO users (id, full_name, email, password, role, tenant_id, is_active)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (email) DO UPDATE
      SET full_name = EXCLUDED.full_name,
          password = EXCLUDED.password,
          role = EXCLUDED.role,
          tenant_id = EXCLUDED.tenant_id,
          is_active = EXCLUDED.is_active,
          updated_at = NOW()
    `,
    [
      user.id,
      user.fullName,
      user.email,
      user.password,
      user.role,
      user.tenantId,
      user.isActive
    ]
  );
}

async function seedDatabase() {
  const adminPassword = await bcrypt.hash("Admin@123", 10);
  const superAdminPassword = await bcrypt.hash("SuperAdmin@123", 10);

  await pool.withTransaction(async (client) => {
    await client.query(
      `
        INSERT INTO tenants (id, name, subdomain, status)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (id) DO UPDATE
        SET name = EXCLUDED.name,
            subdomain = EXCLUDED.subdomain,
            status = EXCLUDED.status,
            updated_at = NOW()
      `,
      [DEMO_TENANT_ID, "Demo Tenant", "demo", "active"]
    );

    await client.query(
      `
        INSERT INTO tenants (id, name, subdomain, status)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (id) DO UPDATE
        SET name = EXCLUDED.name,
            subdomain = EXCLUDED.subdomain,
            status = EXCLUDED.status,
            updated_at = NOW()
      `,
      [ACME_TENANT_ID, "Acme Tenant", "acme", "active"]
    );

    await upsertUser(client, {
      id: SUPER_ADMIN_ID,
      fullName: "Platform Super Admin",
      email: "superadmin@platform.dev",
      password: superAdminPassword,
      role: "super_admin",
      tenantId: null,
      isActive: true
    });

    await upsertUser(client, {
      id: DEMO_ADMIN_ID,
      fullName: "Demo Tenant Admin",
      email: "admin@demo.com",
      password: adminPassword,
      role: "tenant_admin",
      tenantId: DEMO_TENANT_ID,
      isActive: true
    });

    await upsertUser(client, {
      id: DEMO_MEMBER_ID,
      fullName: "Demo Team Member",
      email: "member@demo.com",
      password: adminPassword,
      role: "user",
      tenantId: DEMO_TENANT_ID,
      isActive: true
    });

    await upsertUser(client, {
      id: ACME_ADMIN_ID,
      fullName: "Acme Tenant Admin",
      email: "admin@acme.com",
      password: adminPassword,
      role: "tenant_admin",
      tenantId: ACME_TENANT_ID,
      isActive: true
    });

    await client.query(
      `
        INSERT INTO projects (id, tenant_id, name, description, status, created_by)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (id) DO UPDATE
        SET tenant_id = EXCLUDED.tenant_id,
            name = EXCLUDED.name,
            description = EXCLUDED.description,
            status = EXCLUDED.status,
            created_by = EXCLUDED.created_by,
            updated_at = NOW()
      `,
      [
        DEMO_PROJECT_ID,
        DEMO_TENANT_ID,
        "Demo Launch Plan",
        "Track work for the first tenant rollout.",
        "active",
        DEMO_ADMIN_ID
      ]
    );

    await client.query(
      `
        INSERT INTO projects (id, tenant_id, name, description, status, created_by)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (id) DO UPDATE
        SET tenant_id = EXCLUDED.tenant_id,
            name = EXCLUDED.name,
            description = EXCLUDED.description,
            status = EXCLUDED.status,
            created_by = EXCLUDED.created_by,
            updated_at = NOW()
      `,
      [
        ACME_PROJECT_ID,
        ACME_TENANT_ID,
        "Acme Migration",
        "Separate tenant data used to validate isolation.",
        "planning",
        ACME_ADMIN_ID
      ]
    );

    await client.query(
      `
        INSERT INTO tasks (id, tenant_id, project_id, title, description, status, priority, assignee_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (id) DO UPDATE
        SET tenant_id = EXCLUDED.tenant_id,
            project_id = EXCLUDED.project_id,
            title = EXCLUDED.title,
            description = EXCLUDED.description,
            status = EXCLUDED.status,
            priority = EXCLUDED.priority,
            assignee_id = EXCLUDED.assignee_id,
            updated_at = NOW()
      `,
      [
        DEMO_TASK_ONE_ID,
        DEMO_TENANT_ID,
        DEMO_PROJECT_ID,
        "Prepare onboarding checklist",
        "Outline the first-run experience for new tenant admins.",
        "completed",
        "high",
        DEMO_ADMIN_ID
      ]
    );

    await client.query(
      `
        INSERT INTO tasks (id, tenant_id, project_id, title, description, status, priority, assignee_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (id) DO UPDATE
        SET tenant_id = EXCLUDED.tenant_id,
            project_id = EXCLUDED.project_id,
            title = EXCLUDED.title,
            description = EXCLUDED.description,
            status = EXCLUDED.status,
            priority = EXCLUDED.priority,
            assignee_id = EXCLUDED.assignee_id,
            updated_at = NOW()
      `,
      [
        DEMO_TASK_TWO_ID,
        DEMO_TENANT_ID,
        DEMO_PROJECT_ID,
        "Import existing customer records",
        "Finish the staged data migration for the demo workspace.",
        "in_progress",
        "medium",
        DEMO_MEMBER_ID
      ]
    );

    await client.query(
      `
        INSERT INTO tasks (id, tenant_id, project_id, title, description, status, priority, assignee_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (id) DO UPDATE
        SET tenant_id = EXCLUDED.tenant_id,
            project_id = EXCLUDED.project_id,
            title = EXCLUDED.title,
            description = EXCLUDED.description,
            status = EXCLUDED.status,
            priority = EXCLUDED.priority,
            assignee_id = EXCLUDED.assignee_id,
            updated_at = NOW()
      `,
      [
        ACME_TASK_ID,
        ACME_TENANT_ID,
        ACME_PROJECT_ID,
        "Verify isolated project data",
        "Used to confirm cross-tenant data never leaks between workspaces.",
        "todo",
        "high",
        ACME_ADMIN_ID
      ]
    );
  });

  console.log("Seed data loaded");
}

module.exports = { seedDatabase };
