# Backend Architecture & Database Logic

This document explains how the backend is structured and how data flows at the database and API level.

---

## 1. High-level structure

```
backend/
├── config/           # dev.env, dev.env.example (env vars)
├── src/
│   ├── app.ts        # Express app, CORS, JSON, loads routes, DB init
│   ├── types/        # Express request extensions (req.user)
│   ├── routes/       # Route definitions (user, board, admin, default)
│   ├── controllers/  # Request handlers: call services, return responses
│   ├── middleware/   # userAuth, adminAuth (JWT + DB token check)
│   ├── db/
│   │   ├── mongoose.ts   # MongoDB connection init
│   │   ├── models/       # Mongoose schemas (user, board, list, card, admin)
│   │   └── services/    # Business logic & DB access (User, Board, List, Card, Admin)
│   └── utils/        # constants, ValidationError, apiBuilder, util
└── dist/             # Compiled JS (from tsc)
```

**Flow:** HTTP request → **Route** → **Middleware** (auth if needed) → **Controller** → **Service** (DB + validation) → Response.

---

## 2. Database (MongoDB + Mongoose)

### Connection

- **File:** `src/db/mongoose.ts`
- **When:** `app.ts` calls `initConnection(callback)`; the server starts listening only after `db.once("open", callback)`.
- **Config:** `process.env.Database_URL` from `config/dev.env`.

### Collections (models)

| Collection | Model file | Purpose |
|------------|------------|---------|
| **users** | `db/models/user.ts` | Kanban app users: email, password (bcrypt), name, tokens[], userType, active |
| **admins** | `db/models/admin.ts` | Admin users (separate auth if used) |
| **boards** | `db/models/board.ts` | Board: title, owner (ref User) |
| **lists** | `db/models/list.ts` | List: title, boardId, order |
| **cards** | `db/models/card.ts` | Card: title, listId, boardId, order, dueDate, status (todo/in_progress/done) |

### Relationships and cascade delete

- **Board** → has many **Lists** (list.boardId).
- **List** → has many **Cards** (card.listId).
- **User** owns **Boards** (board.owner = user._id).

**Cascade delete:**

- **Delete board:** Delete all cards in that board’s lists, then all lists, then the board.  
  Implemented in `BoardService.delete()`.
- **Delete list:** Delete all cards in that list, then the list.  
  Implemented in `ListService.delete()`.

### Key field names (constants)

Centralized in `src/utils/constants.ts`: `TableFields` (e.g. `owner`, `boardId`, `listId`, `title`, `order`, `status`), `ValidationMsgs`, `CardStatus`, `ResponseStatus`, `PASSWORD_REGEX`.

---

## 3. Routes and auth

### API builder

- **File:** `src/utils/apiBuilder.ts`
- **Role:** Fluent API to define route + method + optional auth + handler. Catches errors and sends:
  - **200** + body on success.
  - **400** + `{ error: "message" }` for `ValidationError`.
  - **401** from auth middleware for invalid/missing token.
  - **500** + `{ error: "message" }` for other errors.

### User routes (`/user`)

| Method | Path | Auth | Controller | Purpose |
|--------|------|------|------------|---------|
| POST | /user/signup | No | UserController.signup | Register: name, email, password |
| POST | /user/login | No | UserController.login | Login: email, password → user + token |
| POST | /user/logout | Yes | UserController.logout | Invalidate token |
| GET | /user/me | Yes | UserController.me | Current user |

Protected routes use `useUserAuth()`: checks `Authorization: Bearer <token>`, verifies JWT and that the token exists in the user’s `tokens` array, then sets `req.user`.

### Board/List/Card routes (`/user`)

All require **user auth** (`useUserAuth()`). Ownership is enforced in **services**: every operation that touches a board checks `Board.findOne({ _id: boardId, owner: userId })`.

| Method | Path | Controller | Purpose |
|--------|------|------------|---------|
| GET | /user/boards | BoardController.list | List boards for req.user |
| POST | /user/boards | BoardController.create | Create board (title) |
| GET | /user/boards/:boardId | BoardController.getOne | Board + lists + cards (with filters & list pagination) |
| DELETE | /user/boards/:boardId | BoardController.remove | Cascade delete board |
| POST | /user/boards/:boardId/lists | ListController.create | Create list |
| PATCH | /user/boards/:boardId/lists/:listId | ListController.update | Update list (e.g. title) |
| DELETE | /user/boards/:boardId/lists/:listId | ListController.remove | Cascade delete list |
| POST | /user/boards/:boardId/lists/:listId/cards | CardController.create | Create card |
| GET | /user/boards/:boardId/cards | CardController.listByBoard | Cards of board (paginated, filter by status/q) |
| PATCH | /user/cards/:cardId | CardController.update | Update card (title, dueDate, status) |
| DELETE | /user/cards/:cardId | CardController.remove | Delete card |
| PATCH | /user/cards/:cardId/move | CardController.move | Move card to listId + position |

---

## 4. Service layer (DB logic)

Services do **validation**, **ownership checks**, and **DB access**. Controllers only pass `req.body` / params and `req.user._id`.

### UserService

- **signup:** Validate name (required, max 100), email (required, format), password (required, min 8, complexity regex). Check duplicate email. Create user, hash password in model pre-save.
- **login:** Validate email/password, find user by email, check password with bcrypt, return user + JWT.
- **getUserByIdAndToken:** Used by auth middleware to ensure token is in user’s `tokens` array.

### BoardService

- **listByOwner:** `Board.find({ owner: userId })`.
- **getById:** Single board by id + owner.
- **getBoardWithListsAndCards:** Board by id + owner; lists paginated (skip/limit), then cards for those lists with optional filter by `q` (title regex) and `status`; returns board, lists with nested cards, totalLists, totalPages.
- **create:** Validate title, create board with owner.
- **delete:** Verify ownership, then cascade: delete cards in board’s lists, delete lists, delete board.

### ListService

- **create:** Verify board ownership, validate title, assign `order` (max order + 1), create list.
- **update:** Verify board ownership, update list (e.g. title, order).
- **delete:** Verify board ownership, delete all cards in list, then list.

### CardService

- **create:** Verify board ownership and that list belongs to board, validate title (and optional dueDate/status), assign `order`, create card.
- **update:** Load card, verify board ownership via card.boardId, update title/dueDate/status.
- **delete:** Verify ownership, delete card, then reindex list order.
- **reindexList:** After delete, ensure list cards have order 0, 1, 2, …
- **move:** Verify ownership and that target list belongs to same board. Same-list: reorder in memory, update only cards whose order changed. Cross-list: update moved card’s listId + order, then reindex old list and new list (only affected cards).
- **listByBoard:** Board ownership, then paginated card list with optional status and `q` filter.

---

## 5. Validation and errors

- **ValidationError** (`utils/ValidationError.ts`): thrown with a message; apiBuilder sends 400 and `{ error: message }`.
- **Validation messages:** Centralized in `constants.ValidationMsgs` (e.g. "Email is required.", "Name is required.", "Must be minimum 8 characters.") and used in both auth and signup.
- **Invalid input:** Controllers/services validate types and required fields; invalid dates (e.g. card dueDate) throw ValidationError. Auth middleware sends 401 for invalid/missing token or inactive user.

---

## 6. Summary

- **DB:** MongoDB; Mongoose models for users, boards, lists, cards; cascade delete at board and list level.
- **API:** Express; routes in `routes/`, handlers in `controllers/`, logic in `db/services/`; auth via JWT + user token store.
- **Security:** All board/list/card operations check board ownership; passwords hashed with bcrypt; validation and error messages aligned between signup/login and backend.
