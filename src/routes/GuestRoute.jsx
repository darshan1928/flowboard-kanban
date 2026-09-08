import { Navigate, Outlet } from "react-router-dom";
import { useAppSelector } from "../app/hooks";
import {
  selectIsAuthenticated,
  selectAuthBootstrapped,
} from "../features/auth/authSlice";

export default function GuestRoute() {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const bootstrapped = useAppSelector(selectAuthBootstrapped);

  if (!bootstrapped) return null;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  return <Outlet />;
}
