import { Droppable } from "@hello-pangea/dnd";
import TaskCard from "./TaskCard";

const STAGE_COLORS = {
  0: "var(--stage-backlog)",
  1: "var(--stage-todo)",
  2: "var(--stage-ongoing)",
  3: "var(--stage-done)",
};

export default function StageColumn({ stage, tasks, onBack, onForward, onEdit, onDelete }) {
  const color = STAGE_COLORS[stage.id];

  return (
    <section className="stage-column">
      <div className="stage-column-head" style={{ "--stage-color": color }}>
        <h2>{stage.label}</h2>
        <span className="stage-count">{tasks.length}</span>
      </div>

      <Droppable droppableId={String(stage.id)}>
        {(provided, snapshot) => (
          <div
            className={`stage-column-body ${snapshot.isDraggingOver ? "drag-over" : ""}`}
            ref={provided.innerRef}
            {...provided.droppableProps}
          >
            {tasks.length === 0 && !snapshot.isDraggingOver && (
              <div className="stage-empty">No tasks in {stage.label}</div>
            )}
            {tasks.map((task, index) => (
              <TaskCard
                key={task.id}
                task={task}
                index={index}
                stageColor={color}
                isFirstStage={stage.id === 0}
                isLastStage={stage.id === 3}
                onBack={onBack}
                onForward={onForward}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </section>
  );
}
