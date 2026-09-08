import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as api from "../../api/mockBackend";
import { AUTH_TOKEN_KEY } from "../../utils/constants";

export const signupUser = createAsyncThunk(
  "auth/signup",
  async (payload, { rejectWithValue }) => {
    try {
      return await api.signup(payload);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const loginUser = createAsyncThunk(
  "auth/login",
  async (payload, { rejectWithValue }) => {
    try {
      const { token, user } = await api.login(payload);
      localStorage.setItem(AUTH_TOKEN_KEY, token);
      return { token, user };
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const restoreSession = createAsyncThunk(
  "auth/restoreSession",
  async (_, { rejectWithValue }) => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    if (!token) return rejectWithValue("NO_SESSION");
    try {
      const user = await api.getSession(token);
      return { token, user };
    } catch (err) {
      localStorage.removeItem(AUTH_TOKEN_KEY);
      return rejectWithValue(err.message);
    }
  }
);

export const logoutUser = createAsyncThunk("auth/logout", async (_, { getState }) => {
  const { token } = getState().auth;
  if (token) await api.logout(token);
  localStorage.removeItem(AUTH_TOKEN_KEY);
  return true;
});

const initialState = {
  user: null,
  token: null,
  status: "idle", // idle | loading | authenticated | error
  bootstrapped: false, // whether we've attempted session restore on load
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearAuthError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Signup
      .addCase(signupUser.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(signupUser.fulfilled, (state) => {
        state.status = "idle"; // user must log in explicitly after registering
      })
      .addCase(signupUser.rejected, (state, action) => {
        state.status = "error";
        state.error = action.payload || "Registration failed";
      })
      // Login
      .addCase(loginUser.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = "authenticated";
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.bootstrapped = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = "error";
        state.error = action.payload || "Login failed";
        state.bootstrapped = true;
      })
      // Restore session on app load
      .addCase(restoreSession.pending, (state) => {
        state.status = "loading";
      })
      .addCase(restoreSession.fulfilled, (state, action) => {
        state.status = "authenticated";
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.bootstrapped = true;
      })
      .addCase(restoreSession.rejected, (state) => {
        state.status = "idle";
        state.user = null;
        state.token = null;
        state.bootstrapped = true;
      })
      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.status = "idle";
        state.user = null;
        state.token = null;
      });
  },
});

export const { clearAuthError } = authSlice.actions;
export default authSlice.reducer;

export const selectCurrentUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.status === "authenticated";
export const selectAuthBootstrapped = (state) => state.auth.bootstrapped;
