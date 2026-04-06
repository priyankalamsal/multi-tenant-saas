import axios from "axios";

const AUTH_STORAGE_KEY = "saas-auth";
const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

export function getStoredSession() {
  const rawSession = localStorage.getItem(AUTH_STORAGE_KEY);

  if (rawSession) {
    try {
      return JSON.parse(rawSession);
    } catch (error) {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }

  const legacyToken = localStorage.getItem("token");
  return legacyToken ? { token: legacyToken, user: null, tenant: null } : null;
}

export function getToken() {
  return getStoredSession()?.token || "";
}

export function persistSession(session) {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
  localStorage.setItem("token", session.token);
}

export function clearSession() {
  localStorage.removeItem(AUTH_STORAGE_KEY);
  localStorage.removeItem("token");
}

export function extractErrorMessage(error, fallback = "Something went wrong") {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    fallback
  );
}

export function handleUnauthorized(error) {
  if (error?.response?.status === 401) {
    clearSession();
    window.location.href = "/login";
    return true;
  }

  return false;
}

const api = axios.create({
  baseURL: API_BASE_URL
});

api.interceptors.request.use((config) => {
  const token = getToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;
