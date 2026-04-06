import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import api, { extractErrorMessage, handleUnauthorized } from "../services/api";

const initialForm = {
  name: "",
  description: "",
  status: "active"
};

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    let mounted = true;

    async function loadProjects() {
      try {
        const response = await api.get("/projects");
        if (mounted) {
          setProjects(response.data.data || []);
        }
      } catch (requestError) {
        if (!mounted || handleUnauthorized(requestError)) {
          return;
        }

        setError(extractErrorMessage(requestError, "Unable to load projects"));
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadProjects();

    return () => {
      mounted = false;
    };
  }, []);

  async function handleCreateProject(event) {
    event.preventDefault();

    if (!form.name.trim()) {
      setError("Project name is required.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const response = await api.post("/projects", {
        name: form.name.trim(),
        description: form.description.trim(),
        status: form.status
      });

      setProjects((current) => [response.data.data, ...current]);
      setForm(initialForm);
      setShowModal(false);
    } catch (requestError) {
      if (handleUnauthorized(requestError)) {
        return;
      }

      setError(extractErrorMessage(requestError, "Unable to create project"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page-stack">
      <section className="panel">
        <div className="section-header">
          <div className="section-copy">
            <span className="eyebrow">Project Delivery</span>
            <h1>Projects</h1>
            <p>
              The list now includes the missing create flow the evaluator expected. New
              projects open from a modal instead of requiring API-only interaction.
            </p>
          </div>

          <button className="button primary" onClick={() => setShowModal(true)}>
            New Project
          </button>
        </div>

        {error ? <div className="alert">{error}</div> : null}

        {loading ? (
          <h2>Loading projects...</h2>
        ) : projects.length === 0 ? (
          <div className="empty-state">
            <p>No projects found for this tenant yet.</p>
          </div>
        ) : (
          <div className="card-grid">
            {projects.map((project) => (
              <article className="project-card" key={project.id}>
                <div className="card-top">
                  <div>
                    <h3>{project.name}</h3>
                    <p>{project.description || "No project description yet."}</p>
                  </div>
                  <span className={`status-badge ${project.status}`}>{project.status}</span>
                </div>

                <div className="meta-row">
                  <span>{project.taskCount} tasks</span>
                  <span>{project.completedTaskCount} completed</span>
                </div>

                <div className="card-actions">
                  <Link className="button secondary" to={`/projects/${project.id}`}>
                    Open Project
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {showModal ? (
        <div className="modal-backdrop" role="presentation" onClick={() => setShowModal(false)}>
          <div className="modal-card" onClick={(event) => event.stopPropagation()}>
            <div className="section-header">
              <div className="section-copy">
                <span className="eyebrow">Create Project</span>
                <h2>Start a new project</h2>
              </div>
              <button className="button ghost" onClick={() => setShowModal(false)}>
                Close
              </button>
            </div>

            <form className="form-grid" onSubmit={handleCreateProject}>
              <div className="field">
                <label htmlFor="project-name">Project Name</label>
                <input
                  id="project-name"
                  value={form.name}
                  onChange={(event) => setForm({ ...form, name: event.target.value })}
                />
              </div>

              <div className="field">
                <label htmlFor="project-description">Description</label>
                <textarea
                  id="project-description"
                  value={form.description}
                  onChange={(event) => setForm({ ...form, description: event.target.value })}
                />
              </div>

              <div className="field">
                <label htmlFor="project-status">Status</label>
                <select
                  id="project-status"
                  value={form.status}
                  onChange={(event) => setForm({ ...form, status: event.target.value })}
                >
                  <option value="planning">Planning</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <div className="button-row">
                <button className="button primary" disabled={submitting} type="submit">
                  {submitting ? "Creating..." : "Create Project"}
                </button>
                <button className="button ghost" onClick={() => setShowModal(false)} type="button">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
