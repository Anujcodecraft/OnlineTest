import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ role, children }) => {
  const { user } = useAuth();

  if (!user || (role && user.role !== role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;