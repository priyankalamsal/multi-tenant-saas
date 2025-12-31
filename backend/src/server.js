require("dotenv").config();
const express = require("express");
const cors = require("cors");

const { runMigrations } = require("./utils/migrate");
const { seedDatabase } = require("./utils/seed");

const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const projectRoutes = require("./routes/projects");
const taskRoutes = require("./routes/tasks");

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);

// Health check (MANDATORY)
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", database: "connected" });
});

const PORT = process.env.PORT || 5000;

(async () => {
  await runMigrations();
  await seedDatabase();

  app.listen(PORT, () => {
    console.log(`Backend running on port ${PORT}`);
  });
})();
