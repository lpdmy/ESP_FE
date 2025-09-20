import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = ({ allowedRoles }) => {
  const user = useSelector((state) => state.user.user);

  console.log('ProtectedRoute - User:', user);
  console.log('ProtectedRoute - Allowed roles:', allowedRoles);
  console.log('ProtectedRoute - User role:', user?.role);

  if (!user) {
    console.log('ProtectedRoute - No user, redirecting to login');
    return <Navigate to="/auth/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    console.log('ProtectedRoute - User role not allowed, redirecting to home');
    return <Navigate to="/" replace />;
  }

  console.log('ProtectedRoute - Access granted');
  return <Outlet />;
};

export default ProtectedRoute;
