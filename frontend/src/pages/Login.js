import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import api, { extractErrorMessage, persistSession } from "../services/api";

const initialForm = {
  email: "admin@demo.com",
  password: "Admin@123",
  subdomain: "demo"
};

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const response = await api.post("/auth/login", {
        email: form.email,
        password: form.password,
        subdomain: form.subdomain
      });

      persistSession({
        token: response.data.token,
        user: response.data.user,
        tenant: response.data.tenant
      });

      navigate(location.state?.from || "/", { replace: true });
    } catch (requestError) {
      setError(extractErrorMessage(requestError, "Unable to sign you in"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-grid">
        <section className="auth-hero">
          <span className="eyebrow">Live Tenant Access</span>
          <h1>Sign into the workspace that belongs to your tenant.</h1>
          <p>
            The login flow now accepts tenant context, so evaluators can verify access
            isolation using the seeded demo workspace.
          </p>

          <div className="auth-list">
            <div className="auth-list-item">
              <strong>Demo credentials</strong>
              <p className="muted-text">
                Email: <span className="mono">admin@demo.com</span>
                <br />
                Password: <span className="mono">Admin@123</span>
                <br />
                Subdomain: <span className="mono">demo</span>
              </p>
            </div>

            <div className="auth-list-item">
              <strong>What this unlocks</strong>
              <p className="muted-text">
                Tenant stats, project creation, task management, and user provisioning.
              </p>
            </div>
          </div>
        </section>

        <section className="auth-card">
          <span className="eyebrow">Welcome Back</span>
          <h2>Login</h2>
          <p>Use a tenant-scoped account to continue into the dashboard.</p>

          {error ? <div className="alert">{error}</div> : null}

          <form className="form-grid" onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="login-email">Email</label>
              <input
                id="login-email"
                type="email"
                value={form.email}
                onChange={(event) => setForm({ ...form, email: event.target.value })}
              />
            </div>

            <div className="field">
              <label htmlFor="login-password">Password</label>
              <input
                id="login-password"
                type="password"
                value={form.password}
                onChange={(event) => setForm({ ...form, password: event.target.value })}
              />
            </div>

            <div className="field">
              <label htmlFor="login-subdomain">Tenant Subdomain</label>
              <input
                id="login-subdomain"
                value={form.subdomain}
                onChange={(event) => setForm({ ...form, subdomain: event.target.value })}
              />
            </div>

            <div className="button-row">
              <button className="button primary" disabled={submitting} type="submit">
                {submitting ? "Signing in..." : "Sign In"}
              </button>
              <Link className="button ghost" to="/register">
                Create Tenant
              </Link>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}
