import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import api, { extractErrorMessage, handleUnauthorized } from "../services/api";

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);
  const [tenant, setTenant] = useState(null);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    let mounted = true;

    async function loadDashboard() {
      try {
        const [meResponse, projectsResponse, tasksResponse] = await Promise.all([
          api.get("/auth/me"),
          api.get("/projects"),
          api.get("/tasks")
        ]);

        if (!mounted) {
          return;
        }

        setUser(meResponse.data.user);
        setTenant(meResponse.data.tenant);
        setProjects(projectsResponse.data.data || []);
        setTasks(tasksResponse.data.data || []);
      } catch (requestError) {
        if (!mounted || handleUnauthorized(requestError)) {
          return;
        }

        setError(extractErrorMessage(requestError, "Unable to load dashboard"));
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      mounted = false;
    };
  }, []);

  const completedTasks = useMemo(
    () => tasks.filter((task) => task.status === "completed").length,
    [tasks]
  );
  const activeProjects = useMemo(
    () => projects.filter((project) => project.status !== "completed").length,
    [projects]
  );

  if (loading) {
    return (
      <div className="panel">
        <h2>Loading dashboard...</h2>
      </div>
    );
  }

  return (
    <div className="page-stack">
      <section className="panel">
        <div className="section-header">
          <div className="section-copy">
            <span className="eyebrow">Tenant Overview</span>
            <h1>{tenant?.name || "Workspace Dashboard"}</h1>
            <p>
              {user?.fullName || user?.email} is signed in with access to tenant-scoped
              data, users, projects, and tasks.
            </p>
          </div>

          <div className="detail-strip">
            <div>
              <span className="eyebrow">Subdomain</span>
              <strong>{tenant?.subdomain || "n/a"}</strong>
            </div>
            <div>
              <span className="eyebrow">Role</span>
              <strong>{user?.role || "user"}</strong>
            </div>
          </div>
        </div>

        {error ? <div className="alert">{error}</div> : null}

        <div className="metric-grid">
          <article className="metric-card">
            <span className="eyebrow">Projects</span>
            <strong>{projects.length}</strong>
            <span>{activeProjects} active projects are in motion.</span>
          </article>

          <article className="metric-card">
            <span className="eyebrow">Tasks</span>
            <strong>{tasks.length}</strong>
            <span>All tasks are filtered by the current tenant.</span>
          </article>

          <article className="metric-card">
            <span className="eyebrow">Completed</span>
            <strong>{completedTasks}</strong>
            <span>Delivery progress based on completed work items.</span>
          </article>
        </div>
      </section>

      <section className="card-grid">
        <article className="split-card">
          <div className="section-header">
            <div className="section-copy">
              <h2>Recent Projects</h2>
              <p>Open a project to review task progress or add new work.</p>
            </div>
            <Link className="button ghost" to="/projects">
              Manage Projects
            </Link>
          </div>

          {projects.length === 0 ? (
            <div className="empty-state">
              <p>No projects yet. Create one from the Projects page.</p>
            </div>
          ) : (
            <div className="table-list">
              {projects.slice(0, 3).map((project) => (
                <div className="project-card" key={project.id}>
                  <div className="card-top">
                    <div>
                      <h3>{project.name}</h3>
                      <p>{project.description || "No description provided yet."}</p>
                    </div>
                    <span className={`status-badge ${project.status}`}>{project.status}</span>
                  </div>

                  <div className="meta-row">
                    <span>{project.taskCount} tasks</span>
                    <span>{project.completedTaskCount} completed</span>
                  </div>

                  <Link className="button secondary" to={`/projects/${project.id}`}>
                    View Project
                  </Link>
                </div>
              ))}
            </div>
          )}
        </article>

        <article className="split-card">
          <div className="section-header">
            <div className="section-copy">
              <h2>Recent Tasks</h2>
              <p>Status updates are available directly from project detail views.</p>
            </div>
          </div>

          {tasks.length === 0 ? (
            <div className="empty-state">
              <p>No tasks available for this tenant yet.</p>
            </div>
          ) : (
            <div className="table-list">
              {tasks.slice(0, 4).map((task) => (
                <div className="task-row" key={task.id}>
                  <div className="task-row-top">
                    <div>
                      <strong>{task.title}</strong>
                      <p className="meta-copy">{task.projectName || "Unassigned project"}</p>
                    </div>
                    <span className={`status-badge ${task.status}`}>{task.status}</span>
                  </div>
                  <p>{task.description || "No task description provided."}</p>
                </div>
              ))}
            </div>
          )}
        </article>
      </section>
    </div>
  );
}
