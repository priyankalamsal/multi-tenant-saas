import React, { useEffect, useState } from "react";
import api from "../services/api";

export default function Projects() {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    async function load() {
      const res = await api.get("/projects");
      setProjects(res.data.data || []);
    }
    load();
  }, []);

  return (
    <div>
      <h2>Projects</h2>
      {projects.length === 0 && <p>No projects found</p>}
      <ul>
        {projects.map((p) => (
          <li key={p.id}>{p.name}</li>
        ))}
      </ul>
    </div>
  );
}
