import { createSlice, createAsyncThunk, createSelector } from "@reduxjs/toolkit";
import * as api from "../../api/mockBackend";

export const loadTasks = createAsyncThunk(
  "tasks/loadTasks",
  async (_, { getState, rejectWithValue }) => {
    try {
      const userId = getState().auth.user.id;
      return await api.fetchTasks(userId);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const addTask = createAsyncThunk(
  "tasks/addTask",
  async (taskInput, { getState, rejectWithValue }) => {
    try {
      const userId = getState().auth.user.id;
      return await api.createTask(userId, taskInput);
    } catch (err) {
      return rejectWithValue({ code: err.code, message: err.message });
    }
  }
);

export const editTask = createAsyncThunk(
  "tasks/editTask",
  async ({ id, updates }, { getState, rejectWithValue }) => {
    try {
      const userId = getState().auth.user.id;
      return await api.updateTask(userId, id, updates);
    } catch (err) {
      return rejectWithValue({ code: err.code, message: err.message });
    }
  }
);

// Optimistic: UI already moved the card before this resolves; on failure we
// roll back using the snapshot captured in the thunk arg.
export const moveTaskStage = createAsyncThunk(
  "tasks/moveTaskStage",
  async ({ id, stage }, { getState, rejectWithValue }) => {
    try {
      const userId = getState().auth.user.id;
      return await api.updateTaskStage(userId, id, stage);
    } catch (err) {
      return rejectWithValue({ id, message: err.message });
    }
  }
);

export const removeTask = createAsyncThunk(
  "tasks/removeTask",
  async (id, { getState, rejectWithValue }) => {
    try {
      const userId = getState().auth.user.id;
      await api.deleteTask(userId, id);
      return id;
    } catch (err) {
      return rejectWithValue({ id, message: err.message });
    }
  }
);

const initialState = {
  byId: {},
  allIds: [],
  status: "idle", // idle | loading | succeeded | failed
  error: null,
  // per-task snapshot used to roll back an optimistic move if the API call fails
  pendingMoveSnapshots: {},
};

const tasksSlice = createSlice({
  name: "tasks",
  initialState,
  reducers: {
    // Applied immediately on drag-drop / back / forward, before the thunk resolves.
    optimisticMoveStage(state, action) {
      const { id, stage } = action.payload;
      const task = state.byId[id];
      if (!task) return;
      state.pendingMoveSnapshots[id] = task.stage;
      task.stage = stage;
    },
    rollbackMoveStage(state, action) {
      const { id } = action.payload;
      const original = state.pendingMoveSnapshots[id];
      if (state.byId[id] && original !== undefined) {
        state.byId[id].stage = original;
      }
      delete state.pendingMoveSnapshots[id];
    },
    optimisticRemove(state, action) {
      const id = action.payload;
      state.allIds = state.allIds.filter((tid) => tid !== id);
      // task object kept in byId under a shadow key so it can be restored
      state.pendingMoveSnapshots[`removed:${id}`] = state.byId[id];
    },
    rollbackRemove(state, action) {
      const id = action.payload;
      const restored = state.pendingMoveSnapshots[`removed:${id}`];
      if (restored && !state.allIds.includes(id)) {
        state.byId[id] = restored;
        state.allIds.push(id);
      }
      delete state.pendingMoveSnapshots[`removed:${id}`];
    },
    clearTasksOnLogout(state) {
      state.byId = {};
      state.allIds = [];
      state.status = "idle";
      state.pendingMoveSnapshots = {};
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadTasks.pending, (state) => {
        state.status = "loading";
      })
      .addCase(loadTasks.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.byId = {};
        state.allIds = [];
        action.payload.forEach((task) => {
          state.byId[task.id] = task;
          state.allIds.push(task.id);
        });
      })
      .addCase(loadTasks.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      .addCase(addTask.fulfilled, (state, action) => {
        const task = action.payload;
        state.byId[task.id] = task;
        state.allIds.push(task.id);
      })

      .addCase(editTask.fulfilled, (state, action) => {
        state.byId[action.payload.id] = action.payload;
      })

      .addCase(moveTaskStage.fulfilled, (state, action) => {
        state.byId[action.payload.id] = action.payload;
        delete state.pendingMoveSnapshots[action.payload.id];
      })
      .addCase(moveTaskStage.rejected, (state, action) => {
        const id = action.meta.arg.id;
        const original = state.pendingMoveSnapshots[id];
        if (state.byId[id] && original !== undefined) {
          state.byId[id].stage = original;
        }
        delete state.pendingMoveSnapshots[id];
      })

      .addCase(removeTask.fulfilled, (state, action) => {
        // allIds was already updated by optimisticRemove; now permanently
        // drop the cached object so it doesn't linger in memory.
        delete state.byId[action.payload];
        delete state.pendingMoveSnapshots[`removed:${action.payload}`];
      })
      .addCase(removeTask.rejected, (state, action) => {
        const id = action.meta.arg;
        const restored = state.pendingMoveSnapshots[`removed:${id}`];
        if (restored && !state.allIds.includes(id)) {
          state.byId[id] = restored;
          state.allIds.push(id);
        }
        delete state.pendingMoveSnapshots[`removed:${id}`];
      });
  },
});

export const {
  optimisticMoveStage,
  rollbackMoveStage,
  optimisticRemove,
  rollbackRemove,
  clearTasksOnLogout,
} = tasksSlice.actions;

export default tasksSlice.reducer;

/* ------------------------- Selectors ------------------------- */

const selectAllIds = (state) => state.tasks.allIds;
const selectById = (state) => state.tasks.byId;

export const selectAllTasks = createSelector(
  [selectAllIds, selectById],
  (allIds, byId) => allIds.map((id) => byId[id])
);

export const selectTasksByStage = createSelector([selectAllTasks], (tasks) => {
  const grouped = { 0: [], 1: [], 2: [], 3: [] };
  tasks.forEach((t) => grouped[t.stage].push(t));
  return grouped;
});

export const selectTaskCounts = createSelector([selectAllTasks], (tasks) => {
  const total = tasks.length;
  const done = tasks.filter((t) => t.stage === 3).length;
  return { total, done, pending: total - done };
});
