import { NavLink, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { logoutUser, selectCurrentUser } from "../features/auth/authSlice";
import { clearTasksOnLogout } from "../features/tasks/tasksSlice";

export default function Navbar() {
  const user = useAppSelector(selectCurrentUser);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await dispatch(logoutUser());
    dispatch(clearTasksOnLogout());
    navigate("/login", { replace: true });
  };

  return (
    <header className="top-nav">
      <span className="brand">Flowboard</span>
      <nav>
        <NavLink to="/dashboard" className={({ isActive }) => (isActive ? "active" : "")}>
          Dashboard
        </NavLink>
        <NavLink to="/board" className={({ isActive }) => (isActive ? "active" : "")}>
          Board
        </NavLink>
        {user && <span style={{ color: "#8b96a8", fontSize: "0.85rem" }}>{user.name}</span>}
        <button type="button" className="linklike" onClick={handleLogout}>
          Log out
        </button>
      </nav>
    </header>
  );
}
