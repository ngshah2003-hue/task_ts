# Frontend Setup (Simple Kanban)

React + TypeScript + Vite, with Redux Toolkit, React Router, and Bootstrap.

## Prerequisites

- **Node.js** (v18+ recommended)
- **npm** or **yarn**
- Backend API running (see `backend/SETUP.md`)

## 1. Install dependencies

```bash
cd frontend
npm install
```

## 2. API base URL

The app calls the backend for auth and Kanban data. Set the API base URL:

**In `src/utils/constants.ts`, set `BASE_URL` to your backend (e.g. `http://localhost:8009/`)

Ensure the URL matches the backend `PORT` from `backend/config/dev.env`.

## 3. Run development server

```bash
npm run dev
```

Runs Vite dev server (often `http://localhost:5173`). Open in browser and log in or register; the app will call the backend for boards, lists, and cards.

## 4. Build for production

```bash
npm run build
```

TypeScript compile + Vite build; output in `dist/`. Serve `dist/` with any static host.

## 5. Other scripts

- **Lint:** `npm run lint` (ESLint)
- **Lint + fix:** `npm run lint:fix`
- **Format:** `npm run format` (Prettier)
- **Preview build:** `npm run preview` (serve `dist/` locally)

## Tech stack (summary)

- **UI:** React 18, React Bootstrap, Bootstrap Icons
- **State:** Redux Toolkit (auth, boards list, board detail with lists/cards)
- **Routing:** React Router 6
- **Forms:** Formik + Yup (login, register)
- **HTTP:** Axios (see `src/api/kanbanApi.ts`)
- **Drag and drop:** @dnd-kit (board detail)
- **Notifications:** react-toastify
