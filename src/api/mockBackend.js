/**
 * Mock REST backend.
 *
 * This project targets a real backend exposing the endpoints listed in the
 * PRD (§7). Since no backend was in scope for this bench task, this module
 * simulates that same contract (async, latency, error shapes) on top of
 * localStorage so the app is fully functional standalone. Swap the calls in
 * `api/*.js` for real `fetch` calls against your backend when one exists —
 * feature slices never talk to localStorage directly, only to these
 * functions, so the swap is isolated to this file.
 *
 * NOTE: password is stored as-is here for demo purposes only. A real
 * backend MUST hash passwords (bcrypt/argon2) — never replicate this
 * approach server-side.
 */
import { v4 as uuid } from "uuid";

const DB_USERS = "flowboard_db_users";
const DB_TASKS = "flowboard_db_tasks";
const DB_SESSIONS = "flowboard_db_sessions";

const delay = (ms = 350) => new Promise((res) => setTimeout(res, ms));

function readDB(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeDB(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function apiError(code, message) {
  const err = new Error(message);
  err.code = code;
  return err;
}

/* ---------------------------- AUTH ---------------------------- */

export async function signup(payload) {
  await delay();
  const users = readDB(DB_USERS);

  const emailTaken = users.some(
    (u) => u.email.toLowerCase() === payload.email.toLowerCase()
  );
  if (emailTaken) throw apiError("EMAIL_TAKEN", "Email is already registered");

  const usernameTaken = users.some(
    (u) => u.username.toLowerCase() === payload.username.toLowerCase()
  );
  if (usernameTaken)
    throw apiError("USERNAME_TAKEN", "Username is already taken");

  const user = {
    id: uuid(),
    name: payload.name.trim(),
    username: payload.username.trim(),
    email: payload.email.trim().toLowerCase(),
    contactNumber: payload.contactNumber || null,
    avatarUrl: payload.avatarUrl || null,
    password: payload.password, // demo only, see file header
  };
  users.push(user);
  writeDB(DB_USERS, users);

  return publicUser(user);
}

export async function checkAvailability({ field, value }) {
  await delay(250);
  const users = readDB(DB_USERS);
  if (!value) return { available: true };
  const taken = users.some(
    (u) => u[field] && u[field].toLowerCase() === value.toLowerCase()
  );
  return { available: !taken };
}

export async function login({ identifier, password }) {
  await delay();
  const users = readDB(DB_USERS);
  const user = users.find(
    (u) =>
      u.username.toLowerCase() === identifier.toLowerCase() ||
      u.email.toLowerCase() === identifier.toLowerCase()
  );

  // Deliberately generic message: never reveal whether username or
  // password was the wrong part (PRD §5.2 security note).
  if (!user || user.password !== password) {
    throw apiError("INVALID_CREDENTIALS", "Invalid username/email or password");
  }

  const token = uuid();
  const sessions = readDB(DB_SESSIONS);
  sessions.push({ token, userId: user.id, createdAt: Date.now() });
  writeDB(DB_SESSIONS, sessions);

  return { token, user: publicUser(user) };
}

export async function getSession(token) {
  await delay(150);
  if (!token) throw apiError("NO_SESSION", "No active session");
  const sessions = readDB(DB_SESSIONS);
  const session = sessions.find((s) => s.token === token);
  if (!session) throw apiError("SESSION_EXPIRED", "Session expired, please log in again");

  const users = readDB(DB_USERS);
  const user = users.find((u) => u.id === session.userId);
  if (!user) throw apiError("SESSION_EXPIRED", "Session expired, please log in again");
  return publicUser(user);
}

export async function logout(token) {
  await delay(150);
  const sessions = readDB(DB_SESSIONS).filter((s) => s.token !== token);
  writeDB(DB_SESSIONS, sessions);
  return { success: true };
}

function publicUser(user) {
  // eslint-disable-next-line no-unused-vars
  const { password, ...rest } = user;
  return rest;
}

/* ---------------------------- TASKS ---------------------------- */

function loadUserTasks(userId) {
  return readDB(DB_TASKS).filter((t) => t.userId === userId);
}

export async function fetchTasks(userId) {
  await delay();
  return loadUserTasks(userId).sort((a, b) => a.createdAt - b.createdAt);
}

export async function createTask(userId, { name, priority, deadline }) {
  await delay();
  const all = readDB(DB_TASKS);
  const trimmedName = name.trim();

  const duplicate = all.some(
    (t) =>
      t.userId === userId &&
      t.name.toLowerCase() === trimmedName.toLowerCase()
  );
  if (duplicate) {
    throw apiError("TASK_NAME_DUPLICATE", "A task with this name already exists");
  }

  const task = {
    id: uuid(),
    userId,
    name: trimmedName,
    stage: 0,
    priority,
    deadline,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  all.push(task);
  writeDB(DB_TASKS, all);
  return task;
}

export async function updateTask(userId, taskId, updates) {
  await delay();
  const all = readDB(DB_TASKS);
  const idx = all.findIndex((t) => t.id === taskId && t.userId === userId);
  if (idx === -1) throw apiError("TASK_NOT_FOUND", "Task not found");

  if (updates.name) {
    const trimmedName = updates.name.trim();
    const duplicate = all.some(
      (t) =>
        t.userId === userId &&
        t.id !== taskId &&
        t.name.toLowerCase() === trimmedName.toLowerCase()
    );
    if (duplicate) {
      throw apiError("TASK_NAME_DUPLICATE", "A task with this name already exists");
    }
    updates = { ...updates, name: trimmedName };
  }

  all[idx] = { ...all[idx], ...updates, updatedAt: Date.now() };
  writeDB(DB_TASKS, all);
  return all[idx];
}

export async function updateTaskStage(userId, taskId, stage) {
  return updateTask(userId, taskId, { stage });
}

export async function deleteTask(userId, taskId) {
  await delay();
  const all = readDB(DB_TASKS);
  const exists = all.some((t) => t.id === taskId && t.userId === userId);
  if (!exists) throw apiError("TASK_NOT_FOUND", "Task not found");
  writeDB(
    DB_TASKS,
    all.filter((t) => !(t.id === taskId && t.userId === userId))
  );
  return { success: true };
}
