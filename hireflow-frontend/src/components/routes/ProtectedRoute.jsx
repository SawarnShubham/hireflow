import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const ProtectedRoute = ({ children, role }) => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;

  if (role && user.role !== role) {
    const fallback = user.role === "RECRUITER" ? "/recruiter/jobs" : "/candidate/jobs";
    return <Navigate to={fallback} replace />;
  }

  return children;
};

export default ProtectedRoute;
