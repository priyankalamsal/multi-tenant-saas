import React from "react";
import { Link, Outlet, useLocation } from "react-router-dom";

export default function Layout() {
  const location = useLocation();

  const logout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  const navLinkStyle = (path) => ({
    textDecoration: "none",
    color: location.pathname === path ? "#2563eb" : "#333",
    fontWeight: location.pathname === path ? "600" : "400"
  });

  return (
    <div
      style={{
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont",
        backgroundColor: "#f8fafc",
        minHeight: "100vh"
      }}
    >
      {/* NAVBAR */}
      <nav
        style={{
          display: "flex",
          alignItems: "center",
          padding: "14px 24px",
          backgroundColor: "#ffffff",
          borderBottom: "1px solid #e5e7eb"
        }}
      >
        <h2 style={{ margin: 0, marginRight: 32, color: "#111827" }}>
          Multi-Tenant SaaS
        </h2>

        <div style={{ display: "flex", gap: 20 }}>
          <Link to="/" style={navLinkStyle("/")}>Dashboard</Link>
          <Link to="/projects" style={navLinkStyle("/projects")}>Projects</Link>
          <Link to="/users" style={navLinkStyle("/users")}>Users</Link>
        </div>

        <div style={{ flex: 1 }} />

        <button
          onClick={logout}
          style={{
            background: "#ef4444",
            color: "#fff",
            border: "none",
            padding: "6px 12px",
            borderRadius: 6,
            cursor: "pointer"
          }}
        >
          Logout
        </button>
      </nav>

      {/* CONTENT */}
      <main
        style={{
          padding: 24,
          maxWidth: 1100,
          margin: "0 auto"
        }}
      >
        <div
          style={{
            background: "#ffffff",
            borderRadius: 8,
            padding: 24,
            boxShadow: "0 1px 3px rgba(0,0,0,0.08)"
          }}
        >
          <Outlet />
        </div>
      </main>
    </div>
  );
}
