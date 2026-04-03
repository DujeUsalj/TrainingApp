const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "tajna123";

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Invalid token format" });
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    req.user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized" });
  }
};

const requireRole = (allowedRoles) => {
  const normalizedAllowed = allowedRoles.map((r) => String(r).toUpperCase());

  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const role = String(req.user.role).toUpperCase();

    if (!normalizedAllowed.includes(role)) {
      return res.status(403).json({ message: "Forbidden: insufficient permissions" });
    }

    next();
  };
};

authMiddleware.requireRole = requireRole;

/** Postavi req.user ako ima valjan Bearer token; inače req.user ostaje undefined (ruta i dalje javna). */
authMiddleware.optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      req.user = undefined;
      return next();
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      req.user = undefined;
      return next();
    }

    req.user = jwt.verify(token, JWT_SECRET);
  } catch {
    req.user = undefined;
  }

  next();
};

module.exports = authMiddleware;
