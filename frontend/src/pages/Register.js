import React, { useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [org, setOrg] = useState("");
  const [subdomain, setSubdomain] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setMsg("");
    setLoading(true);
    try {
      // endpoint may differ; use register tenant route name from backend
      await api.post("/auth/register-tenant", {
        tenantName: org,
        subdomain,
        adminEmail: email,
        adminPassword: pw,
        adminFullName: name,
      });
      setMsg("Registered — you can now login");
      setTimeout(() => nav("/login"), 1000);
    } catch (err) {
      setMsg(err?.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 560, margin: "30px auto", fontFamily: "sans-serif" }}>
      <h2>Register Tenant</h2>
      <form onSubmit={submit}>
        <div><label>Organization</label><input value={org} onChange={e=>setOrg(e.target.value)} style={{width:'100%'}}/></div>
        <div><label>Subdomain</label><input value={subdomain} onChange={e=>setSubdomain(e.target.value)} style={{width:'100%'}}/></div>
        <div><label>Admin name</label><input value={name} onChange={e=>setName(e.target.value)} style={{width:'100%'}}/></div>
        <div><label>Admin email</label><input value={email} onChange={e=>setEmail(e.target.value)} style={{width:'100%'}}/></div>
        <div><label>Password</label><input type="password" value={pw} onChange={e=>setPw(e.target.value)} style={{width:'100%'}}/></div>
        <div style={{marginTop:8}}>
          <button disabled={loading}>{loading ? "Please wait..." : "Register"}</button>
        </div>
        {msg && <p style={{marginTop:10}}>{msg}</p>}
      </form>
    </div>
  );
}
