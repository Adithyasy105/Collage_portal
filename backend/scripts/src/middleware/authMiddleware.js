import jwt from "jsonwebtoken";

/**
 * Middleware to verify JWT and enforce roles
 * @param {Array<string>} roles - allowed roles (optional)
 */
export function authMiddleware(roles = []) {
  return (req, res, next) => {
    try {
      const authHeader = req.headers["authorization"];
      if (!authHeader?.startsWith("Bearer ")) {
        return res.status(401).json({ message: "No token provided" });
      }

      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = decoded; // e.g. { id, email, role }
      
      console.log("Decoded role:", decoded.role, "Allowed roles:", roles);


      // normalize role to lowercase for comparison
      const userRole = decoded.role?.toLowerCase();
      if (roles.length && !roles.includes(userRole)) {
        return res.status(403).json({ message: "Forbidden: insufficient role" });
      }

      next();
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        return res.status(401).json({ message: "Token expired, please log in again" });
      }
      return res.status(401).json({ message: "Invalid or expired token" });
    }
  };
}
