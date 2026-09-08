import { Draggable } from "@hello-pangea/dnd";

function formatDeadline(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function isOverdue(iso, stage) {
  if (!iso || stage === 3) return false; // don't flag completed tasks
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(iso) < today;
}

export default function TaskCard({ task, index, stageColor, onBack, onForward, onEdit, onDelete, isFirstStage, isLastStage }) {
  const overdue = isOverdue(task.deadline, task.stage);

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <article
          className={`task-card ${snapshot.isDragging ? "dragging" : ""}`}
          style={{ "--stage-color": stageColor, ...provided.draggableProps.style }}
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
        >
          <div className="task-card-top">
            <span className="task-name">{task.name}</span>
            <span className={`priority-chip priority-${task.priority}`}>{task.priority}</span>
          </div>

          <div className={`task-deadline ${overdue ? "overdue" : ""}`}>
            {overdue ? "Overdue — " : "Due "}
            {formatDeadline(task.deadline)}
          </div>

          <div className="task-actions">
            <button
              type="button"
              className="icon-btn"
              aria-label="Move to previous stage"
              title="Move back"
              disabled={isFirstStage}
              onClick={() => onBack(task)}
            >
              ←
            </button>
            <button
              type="button"
              className="icon-btn"
              aria-label="Move to next stage"
              title="Move forward"
              disabled={isLastStage}
              onClick={() => onForward(task)}
            >
              →
            </button>
            <button
              type="button"
              className="icon-btn"
              aria-label="Edit task"
              title="Edit"
              onClick={() => onEdit(task)}
            >
              ✎
            </button>
            <button
              type="button"
              className="icon-btn danger"
              aria-label="Delete task"
              title="Delete"
              onClick={() => onDelete(task)}
            >
              🗑
            </button>
          </div>
        </article>
      )}
    </Draggable>
  );
}
