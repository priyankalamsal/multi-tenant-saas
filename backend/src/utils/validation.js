const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SUBDOMAIN_REGEX = /^[a-z0-9](?:[a-z0-9-]{1,30}[a-z0-9])?$/;

const ALLOWED_ROLES = ["super_admin", "tenant_admin", "user"];
const ALLOWED_PROJECT_STATUSES = ["planning", "active", "completed"];
const ALLOWED_TASK_STATUSES = ["todo", "in_progress", "completed"];
const ALLOWED_TASK_PRIORITIES = ["low", "medium", "high"];

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function normalizeSubdomain(subdomain) {
  return String(subdomain || "").trim().toLowerCase();
}

function validateRequiredFields(fields) {
  return Object.entries(fields)
    .filter(([, value]) => value === undefined || value === null || String(value).trim() === "")
    .map(([key]) => key);
}

function isValidEmail(email) {
  return EMAIL_REGEX.test(normalizeEmail(email));
}

function isValidPassword(password) {
  return typeof password === "string" && password.trim().length >= 8;
}

function isValidSubdomain(subdomain) {
  return SUBDOMAIN_REGEX.test(normalizeSubdomain(subdomain));
}

function normalizeRole(role) {
  const normalizedRole = String(role || "user").trim().toLowerCase();
  return ALLOWED_ROLES.includes(normalizedRole) ? normalizedRole : "user";
}

function normalizeProjectStatus(status) {
  const normalizedStatus = String(status || "active").trim().toLowerCase();
  return ALLOWED_PROJECT_STATUSES.includes(normalizedStatus)
    ? normalizedStatus
    : "active";
}

function normalizeTaskStatus(status) {
  const normalizedStatus = String(status || "todo").trim().toLowerCase();
  const aliasMap = {
    pending: "todo",
    done: "completed"
  };
  const resolvedStatus = aliasMap[normalizedStatus] || normalizedStatus;

  return ALLOWED_TASK_STATUSES.includes(resolvedStatus)
    ? resolvedStatus
    : "todo";
}

function normalizePriority(priority) {
  const normalizedPriority = String(priority || "medium").trim().toLowerCase();
  return ALLOWED_TASK_PRIORITIES.includes(normalizedPriority)
    ? normalizedPriority
    : "medium";
}

module.exports = {
  ALLOWED_ROLES,
  isValidEmail,
  isValidPassword,
  isValidSubdomain,
  normalizeEmail,
  normalizePriority,
  normalizeProjectStatus,
  normalizeRole,
  normalizeSubdomain,
  normalizeTaskStatus,
  validateRequiredFields
};
