const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config");

/**
 * Protects a route: requires a valid "Authorization: Bearer <token>" header.
 * On success, attaches { id, name, email } to req.user.
 */
function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: "You must be logged in to do that." });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Your session has expired. Please log in again." });
  }
}

module.exports = { requireAuth };
