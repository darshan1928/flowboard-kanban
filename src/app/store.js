import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import tasksReducer from "../features/tasks/tasksSlice";
import uiReducer from "../features/ui/uiSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    tasks: tasksReducer,
    ui: uiReducer,
  },
});
