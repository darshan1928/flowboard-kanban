import { createSlice } from "@reduxjs/toolkit";

const uiSlice = createSlice({
  name: "ui",
  initialState: { toast: null },
  reducers: {
    showToast(state, action) {
      const { message, type = "info" } = action.payload;
      state.toast = { message, type, id: Date.now() };
    },
    clearToast(state) {
      state.toast = null;
    },
  },
});

export const { showToast, clearToast } = uiSlice.actions;
export default uiSlice.reducer;
export const selectToast = (state) => state.ui.toast;
