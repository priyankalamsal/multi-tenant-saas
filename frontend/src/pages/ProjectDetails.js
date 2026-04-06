import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";

import api, { extractErrorMessage, handleUnauthorized } from "../services/api";

const initialTaskForm = {
  title: "",
  description: "",
  status: "todo",
  priority: "medium",
  assigneeId: ""
};

export default function ProjectDetails() {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [taskForm, setTaskForm] = useState(initialTaskForm);

  useEffect(() => {
    let mounted = true;

    async function loadProject() {
      try {
        const [projectResponse, usersResponse] = await Promise.all([
          api.get(`/projects/${projectId}`),
          api.get("/users")
        ]);

        if (!mounted) {
          return;
        }

        setProject(projectResponse.data.data);
        setUsers(usersResponse.data.data || []);
      } catch (requestError) {
        if (!mounted || handleUnauthorized(requestError)) {
          return;
        }

        setError(extractErrorMessage(requestError, "Unable to load project details"));
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadProject();

    return () => {
      mounted = false;
    };
  }, [projectId]);

  const completedCount = useMemo(
    () => (project?.tasks || []).filter((task) => task.status === "completed").length,
    [project]
  );

  async function handleCreateTask(event) {
    event.preventDefault();

    if (!taskForm.title.trim()) {
      setError("Task title is required.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const response = await api.post(`/projects/${projectId}/tasks`, {
        title: taskForm.title.trim(),
        description: taskForm.description.trim(),
        status: taskForm.status,
        priority: taskForm.priority,
        assigneeId: taskForm.assigneeId || null
      });

      setProject((current) => ({
        ...current,
        tasks: [response.data.data, ...(current?.tasks || [])]
      }));
      setTaskForm(initialTaskForm);
      setShowTaskModal(false);
    } catch (requestError) {
      if (handleUnauthorized(requestError)) {
        return;
      }

      setError(extractErrorMessage(requestError, "Unable to create task"));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleStatusChange(taskId, nextStatus) {
    try {
      const response = await api.patch(`/tasks/${taskId}/status`, { status: nextStatus });
      const updatedTask = response.data.data;

      setProject((current) => ({
        ...current,
        tasks: (current?.tasks || []).map((task) =>
          task.id === taskId ? { ...task, ...updatedTask } : task
        )
      }));
    } catch (requestError) {
      if (handleUnauthorized(requestError)) {
        return;
      }

      setError(extractErrorMessage(requestError, "Unable to update task status"));
    }
  }

  if (loading) {
    return (
      <div className="panel">
        <h2>Loading project...</h2>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="panel">
        <div className="alert">{error || "Project not found."}</div>
      </div>
    );
  }

  return (
    <div className="page-stack">
      <section className="panel">
        <div className="section-header">
          <div className="section-copy">
            <div className="link-row">
              <Link className="button ghost" to="/projects">
                Back to Projects
              </Link>
            </div>
            <span className="eyebrow">Project Workspace</span>
            <h1>{project.name}</h1>
            <p>{project.description || "No description has been added yet."}</p>
          </div>

          <div className="detail-strip">
            <div>
              <span className="eyebrow">Status</span>
              <strong>{project.status}</strong>
            </div>
            <div>
              <span className="eyebrow">Completed Tasks</span>
              <strong>
                {completedCount}/{project.tasks?.length || 0}
              </strong>
            </div>
          </div>
        </div>

        {error ? <div className="alert">{error}</div> : null}

        <div className="inline-actions">
          <button className="button primary" onClick={() => setShowTaskModal(true)}>
            Add Task
          </button>
        </div>
      </section>

      <section className="panel">
        <div className="section-header">
          <div className="section-copy">
            <h2>Tasks</h2>
            <p>Each task can be updated directly from this view.</p>
          </div>
        </div>

        {!project.tasks || project.tasks.length === 0 ? (
          <div className="empty-state">
            <p>No tasks for this project yet.</p>
          </div>
        ) : (
          <div className="table-list">
            {project.tasks.map((task) => (
              <div className="task-row" key={task.id}>
                <div className="task-row-top">
                  <div>
                    <strong>{task.title}</strong>
                    <p className="meta-copy">
                      Priority: {task.priority || "medium"}
                      {task.assigneeId ? " | Assigned" : " | Unassigned"}
                    </p>
                  </div>
                  <span className={`status-badge ${task.status}`}>{task.status}</span>
                </div>

                <p>{task.description || "No task description provided."}</p>

                <div className="inline-actions">
                  <select
                    value={task.status}
                    onChange={(event) => handleStatusChange(task.id, event.target.value)}
                  >
                    <option value="todo">Todo</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {showTaskModal ? (
        <div className="modal-backdrop" role="presentation" onClick={() => setShowTaskModal(false)}>
          <div className="modal-card" onClick={(event) => event.stopPropagation()}>
            <div className="section-header">
              <div className="section-copy">
                <span className="eyebrow">New Task</span>
                <h2>Add a task to {project.name}</h2>
              </div>
              <button className="button ghost" onClick={() => setShowTaskModal(false)}>
                Close
              </button>
            </div>

            <form className="form-grid" onSubmit={handleCreateTask}>
              <div className="field">
                <label htmlFor="task-title">Title</label>
                <input
                  id="task-title"
                  value={taskForm.title}
                  onChange={(event) => setTaskForm({ ...taskForm, title: event.target.value })}
                />
              </div>

              <div className="field">
                <label htmlFor="task-description">Description</label>
                <textarea
                  id="task-description"
                  value={taskForm.description}
                  onChange={(event) =>
                    setTaskForm({ ...taskForm, description: event.target.value })
                  }
                />
              </div>

              <div className="form-columns">
                <div className="field">
                  <label htmlFor="task-status">Status</label>
                  <select
                    id="task-status"
                    value={taskForm.status}
                    onChange={(event) => setTaskForm({ ...taskForm, status: event.target.value })}
                  >
                    <option value="todo">Todo</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>

                <div className="field">
                  <label htmlFor="task-priority">Priority</label>
                  <select
                    id="task-priority"
                    value={taskForm.priority}
                    onChange={(event) =>
                      setTaskForm({ ...taskForm, priority: event.target.value })
                    }
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div className="field">
                <label htmlFor="task-assignee">Assignee</label>
                <select
                  id="task-assignee"
                  value={taskForm.assigneeId}
                  onChange={(event) =>
                    setTaskForm({ ...taskForm, assigneeId: event.target.value })
                  }
                >
                  <option value="">Unassigned</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.fullName || user.email}
                    </option>
                  ))}
                </select>
              </div>

              <div className="button-row">
                <button className="button primary" disabled={submitting} type="submit">
                  {submitting ? "Creating..." : "Create Task"}
                </button>
                <button className="button ghost" onClick={() => setShowTaskModal(false)} type="button">
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
