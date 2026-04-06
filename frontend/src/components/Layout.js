import React from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";

import { clearSession, getStoredSession } from "../services/api";

export default function Layout() {
  const navigate = useNavigate();
  const session = getStoredSession();
  const tenantName = session?.tenant?.name || "Current Tenant";
  const userName = session?.user?.fullName || session?.user?.email || "Workspace User";

  function handleLogout() {
    clearSession();
    navigate("/login", { replace: true });
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="topbar-inner">
          <div className="brand-mark">MT</div>

          <div className="brand-copy">
            <span className="eyebrow">Tenant Workspace</span>
            <strong>Multi-Tenant SaaS Control Center</strong>
          </div>

          <nav className="nav-links">
            <NavLink to="/" end className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}>
              Dashboard
            </NavLink>
            <NavLink
              to="/projects"
              className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}
            >
              Projects
            </NavLink>
            <NavLink
              to="/users"
              className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}
            >
              Users
            </NavLink>

            <div className="topbar-user">
              <strong>{tenantName}</strong>
              <span>{userName}</span>
            </div>

            <button className="button ghost" onClick={handleLogout}>
              Logout
            </button>
          </nav>
        </div>
      </header>

      <main className="page-shell">
        <Outlet />
      </main>
    </div>
  );
}
