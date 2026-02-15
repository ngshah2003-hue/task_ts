# Kanban Task Boards

A Kanban-style task management app with JWT auth, boards → lists → cards, drag-and-drop, and search/filter.

## Features

- **Auth:** Sign up / Sign in with email and password (form validation).
- **Boards:** Create and delete boards; each user sees only their own.
- **Lists:** Add, edit, and delete lists on a board (cascade delete of cards).
- **Cards:** Add, edit, delete cards; required title, optional due date and status (todo / in_progress / done).
- **Drag & drop:** Move cards within a list or between lists; order is persisted.
- **Search & filter:** Filter cards by keyword and status on the board view.
- **Protected routes:** Dashboard and board pages require authentication.

## Setup

### Backend

1. **Environment**

   Copy or create `backend/config/dev.env`:

   ```env
   PORT=8001
   HOST=http://127.0.0.1
   isProd=false
   Database_URL=mongodb://127.0.0.1:27017/kanban
   JWT_USER_PK=your-secret-key-change-in-production
   ```


2. **Install and run**

   ```bash
   cd backend
   npm install
   npm run build
   npm start
   ```

   API base URL: `http://localhost:8001` (or whatever `HOST:PORT` you set).

   **Dev with auto-reload:**

   ```bash
   npm run dev
   ```

### Frontend

1. **Environment**

   If unset, the app uses `http://localhost:4000` (change in `frontend/src/utils/constants.ts` if your backend is on another port).

2. **Install and run**

   ```bash
   cd frontend
   npm install
   npm run dev
   ```

   Open the URL shown (e.g. `http://localhost:5173`).

## API Overview

- **Auth:** `POST /user/signup`, `POST /user/login`, `POST /user/logout` (Bearer token), `GET /user/me`.
- **Boards:** `GET /user/boards`, `POST /user/boards`, `GET /user/boards/:boardId`, `DELETE /user/boards/:boardId`.
- **Lists:** `POST /user/boards/:boardId/lists`, `PATCH /user/boards/:boardId/lists/:listId`, `DELETE /user/boards/:boardId/lists/:listId`.
- **Cards:**  
  - `POST /user/boards/:boardId/lists/:listId/cards`  
  - `GET /user/boards/:boardId/cards?page=1&limit=20&status=&q=` (pagination + filter)  
  - `PATCH /user/cards/:cardId` (title, dueDate, status)  
  - `DELETE /user/cards/:cardId`  
  - `PATCH /user/cards/:cardId/move` body: `{ listId, position }`.

All board/list/card routes require `Authorization: Bearer <token>` and enforce ownership.

## Tech

- **Backend:** Node, Express, TypeScript, MongoDB (Mongoose), JWT.
- **Frontend:** React, TypeScript, Vite, Redux Toolkit, React Router, Bootstrap, Formik + Yup, @dnd-kit for drag-and-drop.
