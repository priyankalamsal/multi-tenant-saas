import React, { useEffect, useState } from "react";
import api from "../services/api";

export default function Dashboard() {
  const [stats, setStats] = useState({
    projects: 0,
    tasks: 0,
    completed: 0
  });

  useEffect(() => {
    async function load() {
      const p = await api.get("/projects");
      const t = await api.get("/tasks");

      const tasks = t.data.data || [];
      setStats({
        projects: (p.data.data || []).length,
        tasks: tasks.length,
        completed: tasks.filter((x) => x.status === "completed").length
      });
    }
    load();
  }, []);

  return (
    <div>
      <h2>Dashboard</h2>
      <p>Total Projects: {stats.projects}</p>
      <p>Total Tasks: {stats.tasks}</p>
      <p>Completed: {stats.completed}</p>
    </div>
  );
}
