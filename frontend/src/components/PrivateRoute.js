import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

import { getToken } from "../services/api";

export default function PrivateRoute({ children }) {
  const location = useLocation();

  if (!getToken()) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return children || <Outlet />;
}
