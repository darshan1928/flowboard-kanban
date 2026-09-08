import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { selectCurrentUser } from "../auth/authSlice";
import { loadTasks, selectTaskCounts } from "../tasks/tasksSlice";
import "../../styles/dashboard.css";

export default function Dashboard() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector(selectCurrentUser);
  const counts = useAppSelector(selectTaskCounts);
  const tasksStatus = useAppSelector((s) => s.tasks.status);

  useEffect(() => {
    // Load once per session; Board page shares the same store slice so
    // counts stay in sync without a second fetch when navigating there.
    if (tasksStatus === "idle") dispatch(loadTasks());
  }, [dispatch, tasksStatus]);

  return (
    <div className="page">
      <div className="dash-header">
        <h1>Hi {user?.name?.split(" ")[0]}, here's where things stand</h1>
        <p>A quick look at your task load across every stage.</p>
      </div>

      {tasksStatus === "loading" && counts.total === 0 ? (
        <div className="empty-state">Loading your tasks…</div>
      ) : counts.total === 0 ? (
        <div className="empty-state">
          You don't have any tasks yet. Head to the board to create your first one.
        </div>
      ) : (
        <div className="stat-grid">
          <div className="stat-card stat-total">
            <div className="stat-value">{counts.total}</div>
            <div className="stat-label">Total tasks</div>
          </div>
          <div className="stat-card stat-done">
            <div className="stat-value">{counts.done}</div>
            <div className="stat-label">Completed</div>
          </div>
          <div className="stat-card stat-pending">
            <div className="stat-value">{counts.pending}</div>
            <div className="stat-label">Pending</div>
          </div>
        </div>
      )}

      <div className="dash-cta">
        <button type="button" className="btn btn-primary" onClick={() => navigate("/board")}>
          Go to board
        </button>
      </div>
    </div>
  );
}
