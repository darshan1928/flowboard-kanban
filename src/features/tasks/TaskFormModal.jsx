import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { taskSchema } from "../../utils/validationSchemas";
import { PRIORITIES } from "../../utils/constants";

export default function TaskFormModal({ task, onSave, onCancel, serverError }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(taskSchema),
    defaultValues: {
      name: task.name,
      priority: task.priority,
      deadline: task.deadline,
    },
  });

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="edit-title">
      <div className="modal-card">
        <h2 id="edit-title">Edit task</h2>

        {serverError && <div className="form-error-banner">{serverError}</div>}

        <form onSubmit={handleSubmit(onSave)} noValidate>
          <div className={`field ${errors.name ? "has-error" : ""}`}>
            <label htmlFor="edit-name">Task name</label>
            <input id="edit-name" type="text" {...register("name")} />
            {errors.name && <span className="field-error">{errors.name.message}</span>}
          </div>

          <div className={`field ${errors.priority ? "has-error" : ""}`}>
            <label htmlFor="edit-priority">Priority</label>
            <select id="edit-priority" {...register("priority")}>
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </option>
              ))}
            </select>
            {errors.priority && <span className="field-error">{errors.priority.message}</span>}
          </div>

          <div className={`field ${errors.deadline ? "has-error" : ""}`}>
            <label htmlFor="edit-deadline">Deadline</label>
            <input id="edit-deadline" type="date" {...register("deadline")} />
            {errors.deadline && <span className="field-error">{errors.deadline.message}</span>}
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={onCancel}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? "Saving…" : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
