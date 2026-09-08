import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { selectToast, clearToast } from "../features/ui/uiSlice";

export default function Toast() {
  const toast = useAppSelector(selectToast);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => dispatch(clearToast()), 3200);
    return () => clearTimeout(timer);
  }, [toast, dispatch]);

  if (!toast) return null;

  return (
    <div className={`toast ${toast.type}`} role="status" aria-live="polite">
      {toast.message}
    </div>
  );
}
