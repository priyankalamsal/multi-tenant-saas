const jwt = require("jsonwebtoken");

function buildTokenPayload(user) {
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    tenantId: user.tenant_id || user.tenantId || null
  };
}

function signToken(user) {
  return jwt.sign(buildTokenPayload(user), process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "1d"
  });
}

function serializeTenant(tenant) {
  const tenantId = tenant && (tenant.tenant_id || tenant.tenantId || tenant.id);

  if (!tenant || !tenantId) {
    return null;
  }

  return {
    id: tenantId,
    name: tenant.name,
    subdomain: tenant.subdomain,
    status: tenant.status || "active"
  };
}

function serializeUser(user) {
  return {
    id: user.id,
    fullName: user.full_name || user.fullName || "",
    email: user.email,
    role: user.role,
    tenantId: user.tenant_id || user.tenantId || null,
    isActive: user.is_active !== false
  };
}

module.exports = {
  buildTokenPayload,
  serializeTenant,
  serializeUser,
  signToken
};
