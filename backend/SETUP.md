# Backend Setup (Simple Kanban)

Node.js + Express + TypeScript API with MongoDB (Mongoose). No Husky or ESLint in this project; TypeScript handles type checking.

## Prerequisites

- **Node.js** (v18+ recommended)
- **MongoDB** running locally or a connection string (e.g. Atlas)
- **npm** or **yarn**

## 1. Install dependencies

```bash
cd backend
npm install
```

## 2. Environment configuration

Copy the example env and set your values:

```bash
cp config/dev.env.example config/dev.env
```

Edit `config/dev.env`:

| Variable | Description |
|----------|-------------|
| `PORT` | Server port (e.g. `8000` or `8009`) |
| `HOST` | Base host (e.g. `http://127.0.0.1`) |
| `Database_URL` | MongoDB connection string (e.g. `mongodb://127.0.0.1:27017/kanban`) |
| `JWT_USER_PK` | Secret for signing user JWT tokens (change in production) |

## 3. Build

```bash
npm run build
```

Compiles TypeScript from `src/` to `dist/`.

## 4. Run

**Production-style (run compiled JS):**

```bash
npm start
```

Uses `config/dev.env` and runs `node dist/app.js`.

**Development (watch + recompile):**

```bash
npm run dev
```

Watches `src/`, recompiles with `tsc`, and restarts the server on changes.

**Alternative dev (ts-node, no dist):**

```bash
npm run dev:ts-node
```

Runs `src/app.ts` directly with ts-node (no `dist/`).

## 5. Verify

- Server logs: `Server running on http://127.0.0.1:PORT`
- DB: `Database Connection Established✅`
- Health: `GET http://localhost:PORT/` → 200

## API base URL for frontend

Use the same `PORT` as in `config/dev.env` when setting the frontend API base URL (e.g. `http://localhost:8009` in frontend `.env` or `frontend/src/utils/constants.ts`).
