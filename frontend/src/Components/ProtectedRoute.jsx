import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const userId = localStorage.getItem("user_id");
  const isFirstLogin = localStorage.getItem("is_first_login");

  // 🚫 Not logged in
  if (!userId) {
    return <Navigate to="/login" replace />;
  }

  // 🚫 Force password change
  if (isFirstLogin === "true") {
    return <Navigate to="/change-password" replace />;
  }

  return children;
};

export default ProtectedRoute;
