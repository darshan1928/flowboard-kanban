import { Routes, Route, Navigate } from "react-router-dom";
import GuestRoute from "./GuestRoute";
import ProtectedRoute from "./ProtectedRoute";
import Login from "../features/auth/Login";
import Signup from "../features/auth/Signup";
import Dashboard from "../features/dashboard/Dashboard";
import Board from "../features/tasks/Board";

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<GuestRoute />}>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/board" element={<Board />} />
      </Route>

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
