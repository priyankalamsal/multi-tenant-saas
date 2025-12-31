import React, { useEffect, useState } from "react";
import api from "../services/api";

export default function Users() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    async function load() {
      const res = await api.get("/users");
      setUsers(res.data.data || []);
    }
    load();
  }, []);

  return (
    <div>
      <h2>Users</h2>
      {users.length === 0 && <p>No users found</p>}
      <ul>
        {users.map((u) => (
          <li key={u.id}>
            {u.email} ({u.role})
          </li>
        ))}
      </ul>
    </div>
  );
}
