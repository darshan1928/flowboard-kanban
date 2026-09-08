import { Navigate, Outlet } from "react-router-dom";
import { useAppSelector } from "../app/hooks";
import {
  selectIsAuthenticated,
  selectAuthBootstrapped,
} from "../features/auth/authSlice";
import Navbar from "../components/Navbar";

export default function ProtectedRoute() {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const bootstrapped = useAppSelector(selectAuthBootstrapped);

  // Avoid a flash-redirect to /login while we're still checking localStorage
  // for an existing session on first load.
  if (!bootstrapped) return null;

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return (
    <div className="app-shell">
      <Navbar />
      <Outlet />
    </div>
  );
}
