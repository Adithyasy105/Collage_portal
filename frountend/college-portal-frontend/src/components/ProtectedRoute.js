/*import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem("token"); // or use context
  return isAuthenticated ? children : <Navigate to="/login" />;
};

export default ProtectedRoute;
*/
import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, role }) => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  // Not logged in
  if (!token) return <Navigate to="/login" replace />;

  // Role check (if a role is provided)
  if (role && user.role !== role.toUpperCase()) {
    return <Navigate to="/" replace />; // redirect if role doesn't match
  }

  return children;
};

export default ProtectedRoute;
