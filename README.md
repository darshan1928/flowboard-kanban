**# Flowboard — Kanban Task Manager**

Implementation of the in-scope PRD requirements: **\*\*Registration, Login, Dashboard, and Task Board\*\*** (create/edit/delete, back/forward stage buttons, drag-and-drop including drag-to-trash with confirmation).

Out-of-scope items from the PRD (real-time multi-tab sync, comments/attachments, deadline notifications, admin views, social login) are **\*\*not implemented\*\***.

**## Getting started**

### Local development

\`\`\`bash

npm install

npm start        # runs on [http://localhost:3000](http://localhost:3000)

npm test         # runs the unit tests (validation schemas + tasks reducer/selectors)

npm run build    # production build

\`\`\`

No environment variables or backend are required to run the app locally — see **\*\*Mock backend\*\*** below.

### Docker

The application can also be built and run using Docker.

Make sure Docker Desktop is installed and running.

**### Build Docker image**

From the project root directory:

\`\`\`bash

docker build -t kanban-board .

\`\`\`

This creates a Docker image named \`kanban-board\`.

**### Run Docker container**

\`\`\`bash

docker run --name kanban-board-container -p 3000:3000 kanban-board

\`\`\`

The application will be available at [http://localhost:3000](http://localhost:3000).

The port mapping follows the format:

\`\`\`text

-p HOST_PORT:CONTAINER_PORT

\`\`\`

For this application:

\`\`\`text

Host port:      3000

Container port: 3000

\`\`\`

If port \`3000\` is already in use on the host, another host port can be used:

\`\`\`bash

docker run --name kanban-board-container -p 4000:3000 kanban-board

\`\`\`

The application will then be available at [http://localhost:4000](http://localhost:4000).

**### Stop Docker container**

\`\`\`bash

docker stop kanban-board-container

\`\`\`

**### View running Docker containers**

\`\`\`bash

docker ps

\`\`\`

**## Tech stack**

\- React 18 (functional components + hooks only)

\- Redux Toolkit (\`createSlice\`, \`createAsyncThunk\`, \`createSelector\`) for state

\- React Router v6 for routing + route guards

\- react-hook-form + yup for form state and validation

\- @hello-pangea/dnd for drag-and-drop (maintained fork of react-beautiful-dnd)

\- Docker for containerized application execution

**## Mock backend**

\`src/api/mockBackend.js\` simulates the REST API described in the PRD (§7) using \`localStorage\`, including artificial network latency and the same error-code shape a real backend would return (\`TASK\_NAME\_DUPLICATE\`, \`INVALID\_CREDENTIALS\`, etc.). Feature slices (\`authSlice.js\`, \`tasksSlice.js\`) only call functions from \`api/\*.js\` — never \`localStorage\` directly — so pointing the app at a real backend later means editing \`mockBackend.js\` (or adding a sibling \`realBackend.js\` with the same function signatures) without touching any component or slice.

**\*\*Not replicated on purpose:\*\*** real password hashing (bcrypt/argon2), a real CAPTCHA provider (reCAPTCHA), and real session/JWT invalidation. These are called out in code comments where relevant — do not copy the mock's password handling into a real backend.

**## Project structure**

\`\`\`

src/

├── api/mockBackend.js        # simulated REST layer (see above)

├── app/                      # store, typed hooks

├── components/                # Navbar, Toast (shared/reusable UI)

├── features/

│   ├── auth/                 # Login, Signup, authSlice

│   ├── dashboard/             # Dashboard

│   ├── tasks/                  # Board, StageColumn, TaskCard, modals, tasksSlice

│   └── ui/                    # toast slice

├── routes/                    # ProtectedRoute, GuestRoute, AppRoutes

├── utils/                     # constants, yup validation schemas

└── styles/                    # global.css, dashboard.css, board.css

\`\`\`

**## Notable implementation decisions (see PRD §14 for the full list)**

\- Tasks have an internal \`id\` (UUID) in addition to \`name\`, even though the brief names \`name\` as the unique identifier — renaming a task would otherwise break references. Name-uniqueness-per-user is still enforced as a validation rule.

\- Stage moves and deletes are **\*\*optimistic\*\***: the UI updates immediately, then rolls back with a toast if the (simulated) API call fails — see \`optimisticMoveStage\`/\`rollbackMoveStage\` and \`optimisticRemove\`/\`rollbackRemove\` in \`tasksSlice.js\`.

\- Drag-to-trash never mutates state on drop — it only opens the confirmation dialog. If you cancel, the card simply stays where it was, since nothing was changed yet.

\- Dashboard counts are derived via memoized selectors (\`reselect\`, bundled in Redux Toolkit) from the same \`tasks\` slice the Board uses, so the two pages can never drift apart or double-fetch.

\- CAPTCHA is a lightweight arithmetic challenge generated client-side (no external dependency); swap \`Login.jsx\`'s \`useCaptchaChallenge\` hook for a real provider (e.g. reCAPTCHA) when a backend exists to verify it server-side.

\- The application can be built and run as a Docker container using the provided \`Dockerfile\`.

**## Testing**

\`src/utils/validationSchemas.test.js\` and \`src/features/tasks/tasksSlice.test.js\` cover the validation edge cases and the optimistic-update/rollback logic called out in the PRD. Run with \`npm test\`.

\`\`\`bash

npm test

\`\`\`**# Flowboard — Kanban Task Manager**

Implementation of the in-scope PRD requirements: **\*\*Registration, Login, Dashboard, and Task Board\*\*** (create/edit/delete, back/forward stage buttons, drag-and-drop including drag-to-trash with confirmation).

Out-of-scope items from the PRD (real-time multi-tab sync, comments/attachments, deadline notifications, admin views, social login) are **\*\*not implemented\*\***.

**## Getting started**

### Local development

\`\`\`bash

npm install

npm start        # runs on [http://localhost:3000](http://localhost:3000)

npm test         # runs the unit tests (validation schemas + tasks reducer/selectors)

npm run build    # production build

\`\`\`

No environment variables or backend are required to run the app locally — see **\*\*Mock backend\*\*** below.

### Docker

The application can also be built and run using Docker.

Make sure Docker Desktop is installed and running.

**### Build Docker image**

From the project root directory:

\`\`\`bash

docker build -t kanban-board .

\`\`\`

This creates a Docker image named \`kanban-board\`.

**### Run Docker container**

\`\`\`bash

docker run --name kanban-board-container -p 3000:3000 kanban-board

\`\`\`

The application will be available at [http://localhost:3000](http://localhost:3000).

The port mapping follows the format:

\`\`\`text

-p HOST_PORT:CONTAINER_PORT

\`\`\`

For this application:

\`\`\`text

Host port:      3000

Container port: 3000

\`\`\`

If port \`3000\` is already in use on the host, another host port can be used:

\`\`\`bash

docker run --name kanban-board-container -p 4000:3000 kanban-board

\`\`\`

The application will then be available at [http://localhost:4000](http://localhost:4000).

**### Stop Docker container**

\`\`\`bash

docker stop kanban-board-container

\`\`\`

**### View running Docker containers**

\`\`\`bash

docker ps

\`\`\`

**## Tech stack**

\- React 18 (functional components + hooks only)

\- Redux Toolkit (\`createSlice\`, \`createAsyncThunk\`, \`createSelector\`) for state

\- React Router v6 for routing + route guards

\- react-hook-form + yup for form state and validation

\- @hello-pangea/dnd for drag-and-drop (maintained fork of react-beautiful-dnd)

\- Docker for containerized application execution

**## Mock backend**

\`src/api/mockBackend.js\` simulates the REST API described in the PRD (§7) using \`localStorage\`, including artificial network latency and the same error-code shape a real backend would return (\`TASK\_NAME\_DUPLICATE\`, \`INVALID\_CREDENTIALS\`, etc.). Feature slices (\`authSlice.js\`, \`tasksSlice.js\`) only call functions from \`api/\*.js\` — never \`localStorage\` directly — so pointing the app at a real backend later means editing \`mockBackend.js\` (or adding a sibling \`realBackend.js\` with the same function signatures) without touching any component or slice.

**\*\*Not replicated on purpose:\*\*** real password hashing (bcrypt/argon2), a real CAPTCHA provider (reCAPTCHA), and real session/JWT invalidation. These are called out in code comments where relevant — do not copy the mock's password handling into a real backend.

**## Project structure**

\`\`\`

src/

├── api/mockBackend.js        # simulated REST layer (see above)

├── app/                      # store, typed hooks

├── components/                # Navbar, Toast (shared/reusable UI)

├── features/

│   ├── auth/                 # Login, Signup, authSlice

│   ├── dashboard/             # Dashboard

│   ├── tasks/                  # Board, StageColumn, TaskCard, modals, tasksSlice

│   └── ui/                    # toast slice

├── routes/                    # ProtectedRoute, GuestRoute, AppRoutes

├── utils/                     # constants, yup validation schemas

└── styles/                    # global.css, dashboard.css, board.css

\`\`\`

**## Notable implementation decisions (see PRD §14 for the full list)**

\- Tasks have an internal \`id\` (UUID) in addition to \`name\`, even though the brief names \`name\` as the unique identifier — renaming a task would otherwise break references. Name-uniqueness-per-user is still enforced as a validation rule.

\- Stage moves and deletes are **\*\*optimistic\*\***: the UI updates immediately, then rolls back with a toast if the (simulated) API call fails — see \`optimisticMoveStage\`/\`rollbackMoveStage\` and \`optimisticRemove\`/\`rollbackRemove\` in \`tasksSlice.js\`.

\- Drag-to-trash never mutates state on drop — it only opens the confirmation dialog. If you cancel, the card simply stays where it was, since nothing was changed yet.

\- Dashboard counts are derived via memoized selectors (\`reselect\`, bundled in Redux Toolkit) from the same \`tasks\` slice the Board uses, so the two pages can never drift apart or double-fetch.

\- CAPTCHA is a lightweight arithmetic challenge generated client-side (no external dependency); swap \`Login.jsx\`'s \`useCaptchaChallenge\` hook for a real provider (e.g. reCAPTCHA) when a backend exists to verify it server-side.

\- The application can be built and run as a Docker container using the provided \`Dockerfile\`.

**## Testing**

\`src/utils/validationSchemas.test.js\` and \`src/features/tasks/tasksSlice.test.js\` cover the validation edge cases and the optimistic-update/rollback logic called out in the PRD. Run with \`npm test\`.

\`\`\`bash

npm test

\`\`\`