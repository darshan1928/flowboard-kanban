import { useEffect, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { DragDropContext } from "@hello-pangea/dnd";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { taskSchema } from "../../utils/validationSchemas";
import { STAGES, PRIORITIES } from "../../utils/constants";
import {
  loadTasks,
  addTask,
  editTask,
  removeTask,
  moveTaskStage,
  optimisticMoveStage,
  rollbackMoveStage,
  optimisticRemove,
  rollbackRemove,
  selectTasksByStage,
} from "./tasksSlice";
import { showToast } from "../ui/uiSlice";
import StageColumn from "./StageColumn";
import TrashDropZone from "./TrashDropZone";
import TaskFormModal from "./TaskFormModal";
import ConfirmDialog from "./ConfirmDialog";
import "../../styles/board.css";

export default function Board() {
  const dispatch = useAppDispatch();
  const tasksByStage = useAppSelector(selectTasksByStage);
  const tasksStatus = useAppSelector((s) => s.tasks.status);

  const [isDragging, setIsDragging] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [editError, setEditError] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null); // { task, viaDrag }

  useEffect(() => {
    if (tasksStatus === "idle") dispatch(loadTasks());
  }, [dispatch, tasksStatus]);

  /* ------------------- Create task ------------------- */
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(taskSchema),
    defaultValues: { name: "", priority: "", deadline: "" },
  });
  const [createError, setCreateError] = useState(null);

  const onCreate = async (data) => {
    setCreateError(null);
    const result = await dispatch(addTask(data));
    if (addTask.fulfilled.match(result)) {
      reset({ name: "", priority: "", deadline: "" });
      dispatch(showToast({ message: "Task created", type: "success" }));
    } else {
      setCreateError(result.payload?.message || "Could not create task");
    }
  };

  /* ------------------- Stage movement (buttons + drag) ------------------- */
  const moveStage = useCallback(
    async (task, newStage) => {
      if (newStage < 0 || newStage > 3) return;
      dispatch(optimisticMoveStage({ id: task.id, stage: newStage }));
      const result = await dispatch(moveTaskStage({ id: task.id, stage: newStage }));
      if (moveTaskStage.rejected.match(result)) {
        dispatch(rollbackMoveStage({ id: task.id }));
        dispatch(showToast({ message: "Couldn't move task, please retry", type: "error" }));
      }
    },
    [dispatch]
  );

  const handleDragStart = () => setIsDragging(true);

  const handleDragEnd = (result) => {
    setIsDragging(false);
    const { source, destination, draggableId } = result;
    if (!destination) return; // dropped outside any target -> snap back, no-op

    if (destination.droppableId === "trash") {
      const task = findTaskById(tasksByStage, draggableId);
      if (task) setDeleteTarget({ task, viaDrag: true });
      return; // don't mutate state until confirmed
    }

    const newStage = Number(destination.droppableId);
    const oldStage = Number(source.droppableId);
    if (newStage === oldStage && source.index === destination.index) return;

    const task = findTaskById(tasksByStage, draggableId);
    if (task) moveStage(task, newStage);
  };

  /* ------------------- Edit ------------------- */
  const handleSaveEdit = async (data) => {
    setEditError(null);
    const result = await dispatch(editTask({ id: editingTask.id, updates: data }));
    if (editTask.fulfilled.match(result)) {
      setEditingTask(null);
      dispatch(showToast({ message: "Task updated", type: "success" }));
    } else {
      setEditError(result.payload?.message || "Could not save changes");
    }
  };

  /* ------------------- Delete (manual + via drag-to-trash) ------------------- */
  const confirmDelete = async () => {
    const { task } = deleteTarget;
    setDeleteTarget(null);
    dispatch(optimisticRemove(task.id));
    const result = await dispatch(removeTask(task.id));
    if (removeTask.fulfilled.match(result)) {
      dispatch(showToast({ message: `Deleted "${task.name}"`, type: "success" }));
    } else {
      dispatch(rollbackRemove(task.id));
      dispatch(showToast({ message: "Couldn't delete task, please retry", type: "error" }));
    }
  };

  return (
    <div className="page">
      <div className="board-header">
        <h1>Your board</h1>
      </div>

      <div className="create-task-bar">
        {createError && <div className="form-error-banner">{createError}</div>}
        <form onSubmit={handleSubmit(onCreate)} noValidate>
          <div className={`field ${errors.name ? "has-error" : ""}`}>
            <label htmlFor="task-name">Task name</label>
            <input id="task-name" type="text" placeholder="e.g. Write release notes" {...register("name")} />
            {errors.name && <span className="field-error">{errors.name.message}</span>}
          </div>

          <div className={`field ${errors.priority ? "has-error" : ""}`}>
            <label htmlFor="task-priority">Priority</label>
            <select id="task-priority" defaultValue="" {...register("priority")}>
              <option value="" disabled>
                Select
              </option>
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </option>
              ))}
            </select>
            {errors.priority && <span className="field-error">{errors.priority.message}</span>}
          </div>

          <div className={`field ${errors.deadline ? "has-error" : ""}`}>
            <label htmlFor="task-deadline">Deadline</label>
            <input id="task-deadline" type="date" {...register("deadline")} />
            {errors.deadline && <span className="field-error">{errors.deadline.message}</span>}
          </div>

          <button type="submit" className="btn btn-primary" disabled={isSubmitting} style={{ marginTop: "1.6rem" }}>
            {isSubmitting ? "Adding…" : "Create task"}
          </button>
        </form>
      </div>

      <DragDropContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="board-columns">
          {STAGES.map((stage) => (
            <StageColumn
              key={stage.id}
              stage={stage}
              tasks={tasksByStage[stage.id]}
              onBack={(task) => moveStage(task, task.stage - 1)}
              onForward={(task) => moveStage(task, task.stage + 1)}
              onEdit={(task) => setEditingTask(task)}
              onDelete={(task) => setDeleteTarget({ task, viaDrag: false })}
            />
          ))}
        </div>

        <TrashDropZone />
      </DragDropContext>

      {editingTask && (
        <TaskFormModal
          task={editingTask}
          serverError={editError}
          onSave={handleSaveEdit}
          onCancel={() => {
            setEditingTask(null);
            setEditError(null);
          }}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Delete task"
          message={`Are you sure you want to delete "${deleteTarget.task.name}"? This can't be undone.`}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}

function findTaskById(tasksByStage, id) {
  for (const stageTasks of Object.values(tasksByStage)) {
    const found = stageTasks.find((t) => t.id === id);
    if (found) return found;
  }
  return null;
}
