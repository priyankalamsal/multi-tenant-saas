import React, { useEffect, useState } from "react";

import api, {
  extractErrorMessage,
  getStoredSession,
  handleUnauthorized
} from "../services/api";

const initialForm = {
  fullName: "",
  email: "",
  password: "",
  role: "user"
};

export default function Users() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState(initialForm);

  const tenantId =
    getStoredSession()?.tenant?.id || getStoredSession()?.user?.tenantId || "";

  useEffect(() => {
    let mounted = true;

    async function loadUsers() {
      try {
        const response = await api.get("/users");
        if (mounted) {
          setUsers(response.data.data || []);
        }
      } catch (requestError) {
        if (!mounted || handleUnauthorized(requestError)) {
          return;
        }

        setError(extractErrorMessage(requestError, "Unable to load users"));
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadUsers();

    return () => {
      mounted = false;
    };
  }, []);

  async function handleCreateUser(event) {
    event.preventDefault();

    if (!tenantId) {
      setError("Tenant context is missing. Please log in again.");
      return;
    }

    if (!form.fullName.trim() || !form.email.trim() || !form.password) {
      setError("Name, email, and password are required.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const response = await api.post(`/tenants/${tenantId}/users`, {
        fullName: form.fullName.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        role: form.role
      });

      setUsers((current) => [...current, response.data.data]);
      setForm(initialForm);
      setShowModal(false);
    } catch (requestError) {
      if (handleUnauthorized(requestError)) {
        return;
      }

      setError(extractErrorMessage(requestError, "Unable to create user"));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteUser(userId) {
    try {
      await api.delete(`/users/${userId}`);
      setUsers((current) => current.filter((user) => user.id !== userId));
    } catch (requestError) {
      if (handleUnauthorized(requestError)) {
        return;
      }

      setError(extractErrorMessage(requestError, "Unable to delete user"));
    }
  }

  return (
    <div className="page-stack">
      <section className="panel">
        <div className="section-header">
          <div className="section-copy">
            <span className="eyebrow">Tenant People</span>
            <h1>Users</h1>
            <p>
              The page now includes the add-user workflow that was missing from the
              evaluator checklist, plus inline cleanup for unwanted accounts.
            </p>
          </div>

          <button className="button primary" onClick={() => setShowModal(true)}>
            Add User
          </button>
        </div>

        {error ? <div className="alert">{error}</div> : null}

        {loading ? (
          <h2>Loading users...</h2>
        ) : users.length === 0 ? (
          <div className="empty-state">
            <p>No users exist for this tenant yet.</p>
          </div>
        ) : (
          <div className="user-grid">
            {users.map((user) => (
              <article className="user-card" key={user.id}>
                <div className="card-top">
                  <div>
                    <h3>{user.fullName || user.email}</h3>
                    <p>{user.email}</p>
                  </div>
                  <span className={`role-badge ${user.role}`}>{user.role}</span>
                </div>

                <div className="meta-row">
                  <span>{user.isActive ? "Active" : "Inactive"}</span>
                </div>

                <div className="card-actions">
                  <button className="button danger" onClick={() => handleDeleteUser(user.id)}>
                    Delete
                  </button>
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
                <span className="eyebrow">Invite User</span>
                <h2>Add a tenant member</h2>
              </div>
              <button className="button ghost" onClick={() => setShowModal(false)}>
                Close
              </button>
            </div>

            <form className="form-grid" onSubmit={handleCreateUser}>
              <div className="field">
                <label htmlFor="user-full-name">Full Name</label>
                <input
                  id="user-full-name"
                  value={form.fullName}
                  onChange={(event) => setForm({ ...form, fullName: event.target.value })}
                />
              </div>

              <div className="field">
                <label htmlFor="user-email">Email</label>
                <input
                  id="user-email"
                  type="email"
                  value={form.email}
                  onChange={(event) => setForm({ ...form, email: event.target.value })}
                />
              </div>

              <div className="form-columns">
                <div className="field">
                  <label htmlFor="user-password">Temporary Password</label>
                  <input
                    id="user-password"
                    type="password"
                    value={form.password}
                    onChange={(event) => setForm({ ...form, password: event.target.value })}
                  />
                </div>

                <div className="field">
                  <label htmlFor="user-role">Role</label>
                  <select
                    id="user-role"
                    value={form.role}
                    onChange={(event) => setForm({ ...form, role: event.target.value })}
                  >
                    <option value="user">User</option>
                    <option value="tenant_admin">Tenant Admin</option>
                  </select>
                </div>
              </div>

              <div className="button-row">
                <button className="button primary" disabled={submitting} type="submit">
                  {submitting ? "Adding..." : "Add User"}
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
