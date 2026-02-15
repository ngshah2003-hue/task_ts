# Frontend Architecture & Redux Guide

This document explains how the frontend is structured, how Redux is used, and how to work with it even if you are new to Redux.

---

## 1. Redux in simple terms

**What is Redux?**  
Redux is a **global state store**. Instead of passing data deeply through props, components can:

- **Read** state from the store (e.g. “list of boards”, “current user”).
- **Change** state by **dispatching actions** (e.g. “log in”, “fetch boards”, “add a card”).

**Main ideas:**

1. **Store** – One central object holding all “global” state (auth, boards, board detail).
2. **Actions** – Plain objects describing what happened (e.g. `{ type: 'auth/setCredentials', payload: { user, token } }`). You usually don’t create these by hand; you use **action creators** (functions that return actions).
3. **Reducers** – Functions that take (current state, action) and return the **next state**. They must be pure (no side effects inside).
4. **Dispatch** – The way you “send” an action to the store. The store runs the reducer and updates state; components that read that state re-render.

**In this project we use Redux Toolkit**, which:

- Uses **slices**: each slice has a name, initial state, **reducers** (sync updates), and **extraReducers** (for async thunks).
- **createAsyncThunk**: runs async code (e.g. API call); when it finishes it dispatches `pending` / `fulfilled` / `rejected` actions. The slice’s `extraReducers` handle these to set loading, data, or error.

So in practice you will:

- **Read state:** `useAppSelector(state => state.auth.user)`.
- **Trigger changes:** `dispatch(fetchBoards())` or `dispatch(setCredentials({ user, token }))`.

---

## 2. Frontend folder structure (relevant parts)

```
frontend/src/
├── api/
│   └── kanbanApi.ts      # Axios instance, all API calls (login, boards, lists, cards, move, etc.)
├── store/
│   ├── index.ts          # Create store, combine reducers, export types
│   ├── hooks.ts          # useAppDispatch, useAppSelector (typed)
│   └── slices/
│       ├── authSlice.ts       # token, user, isAuthenticated
│       ├── boardsSlice.ts    # list of boards (Dashboard)
│       └── boardDetailSlice.ts # current board + lists + cards (Board detail page)
├── pages/                # Top-level screens (Login, Register, Dashboard, BoardDetail)
├── components/          # Reusable UI (Navigation, KanbanList, KanbanCard, CardModal, Pagination, etc.)
├── hooks/               # e.g. useDebounce
├── utils/               # constants (BASE_URL), status labels
└── App.tsx              # Router, ProtectedRoute, GuestRoute, Layout
```

---

## 3. The three slices and how they are used

### authSlice

**State:**

- `token: string | null`
- `user: { _id, email?, name? } | null`
- `isAuthenticated: boolean`

**Initial state:** Read from `localStorage` (token, userId, authUser) so refresh keeps the user logged in.

**Actions (you dispatch these):**

- **setCredentials({ user, token })** – After login/signup: save user and token in state and in localStorage.
- **clearCredentials()** – On logout: clear state and localStorage.

**No async thunks.** Login/Register pages call the API themselves, then `dispatch(setCredentials(...))`.

**Where used:**

- **App.tsx:** `useAppSelector(s => s.auth.isAuthenticated)` for ProtectedRoute (redirect to login) and GuestRoute (redirect to dashboard if logged in).
- **Navigation:** Show user name/email and Logout; Logout calls `dispatch(clearCredentials())`.
- **Login/Register:** On success, `dispatch(setCredentials({ user, token }))` then navigate to dashboard.

---

### boardsSlice (Dashboard)

**State:**

- `items: Board[]` – list of boards
- `total: number`
- `loading: boolean`
- `error: string | null`

**Async thunks (you dispatch these):**

- **fetchBoards()** – GET /user/boards, then store sets `items` and `total`.
- **createBoard(title)** – POST create board, then store adds the new board to `items` and increments `total`.
- **removeBoard(boardId)** – DELETE board, then store removes it from `items` and decrements `total`.

**Sync actions:**

- **clearError()** – set `error` to null.
- **clearBoards()** – reset `items` and `total` (e.g. on logout if you want to clear data).

**How it works:**

- **pending:** `loading = true`, `error = null`.
- **fulfilled:** `loading = false`, update `items`/`total` (or add/remove one board).
- **rejected:** `loading = false`, `error = action.payload` (API error message).

**Where used:**

- **Dashboard:** On mount (or when needed), `dispatch(fetchBoards())`. Renders `items`, shows loading/error. “Create board” dispatches `createBoard(title)`; delete dispatches `removeBoard(boardId)`.

---

### boardDetailSlice (Board detail page – lists and cards)

**State:**

- `board: Board | null`
- `lists: List[]` – each list has `cards: Card[]`
- `totalLists`, `totalPages` – for list pagination
- `loading`, `error`

**Async thunks:**

- **fetchBoardDetail({ boardId, params? })** – GET board with lists and cards (optional `q`, `status`, `listPage`, `listLimit`). Fills `board`, `lists`, `totalLists`, `totalPages`.
- **addList({ boardId, title })**
- **updateListTitle({ boardId, listId, title })**
- **removeList({ boardId, listId })**
- **addCard({ boardId, listId, title, dueDate?, status? })**
- **updateCard({ cardId, body })**
- **removeCard(cardId)**
- **moveCardThunk({ cardId, listId, position })** – PATCH move card; server reorders and returns updated card.

**Sync actions (optimistic or local UI updates):**

- **moveCardLocal({ cardId, fromListId, toListId, toIndex })** – Updates `lists` in memory so the card appears in the new list/position immediately; then the page dispatches **moveCardThunk** to persist. If the thunk fails, you can refetch.
- **addCardLocal**, **updateCardLocal**, **removeCardLocal**, **addListLocal**, **removeListLocal** – Used to update UI from thunk results (most are handled in extraReducers).
- **clearBoardDetail()** – Reset board/lists when leaving the page.
- **clearError()**

**Where used:**

- **BoardDetail page:** Dispatches `fetchBoardDetail` with boardId and filters/pagination. Renders lists and cards; drag-and-drop dispatches `moveCardLocal` then `moveCardThunk`. Add list/card, edit, delete all dispatch the corresponding thunks (and sometimes local updates). Loading and errors come from the slice.

---

## 4. How to use Redux in a component

### Reading state

```ts
import { useAppSelector } from '../store/hooks';

const boards = useAppSelector(state => state.boards.items);
const loading = useAppSelector(state => state.boards.loading);
const user = useAppSelector(state => state.auth.user);
```

Only the data you select causes re-renders when that part of state changes.

### Dispatching actions

```ts
import { useAppDispatch } from '../store/hooks';
import { fetchBoards, createBoard } from '../store/slices/boardsSlice';

const dispatch = useAppDispatch();

// Fetch boards (e.g. in useEffect)
useEffect(() => {
  dispatch(fetchBoards());
}, [dispatch]);

// Create board (e.g. on button click)
const handleCreate = () => {
  dispatch(createBoard('My Board')).unwrap()
    .then(() => toast.success('Created'))
    .catch(err => toast.error(err));
};
```

- **dispatch(thunk)** returns a promise. Use **.unwrap()** to get the fulfilled value or throw on rejected (so you can handle success/error in the component).
- For sync actions: `dispatch(clearError())`, `dispatch(setCredentials({ user, token }))`.

### Async thunk lifecycle

When you `dispatch(fetchBoards())`:

1. **fetchBoards.pending** is dispatched → reducer sets `loading = true`.
2. API runs; when it finishes:
   - Success → **fetchBoards.fulfilled** with data → reducer sets `items`, `total`, `loading = false`.
   - Failure → **fetchBoards.rejected** with error → reducer sets `error`, `loading = false`.

You don’t write pending/fulfilled/rejected yourself; `createAsyncThunk` does it. You only handle them in the slice’s `extraReducers`.

---

## 5. API layer

**File:** `src/api/kanbanApi.ts`

- **Axios instance** with base URL; request interceptor adds `Authorization: Bearer <token>` from localStorage.
- **Response interceptor:** On 401, clears token/user and redirects to `/login`.
- **Functions** for each endpoint: `login`, `signup`, `getBoards`, `createBoard`, `getBoard`, `createList`, `updateList`, `deleteList`, `createCard`, `updateCard`, `deleteCard`, `moveCard`, etc.
- **getApiError(err)** – Extracts `err.response.data.error` or a fallback message for toasts.

Slices call these functions inside thunks; they never touch Axios directly in the slice.

---

## 6. Routing and auth

- **ProtectedRoute:** If `!isAuthenticated`, redirect to `/login`; otherwise render children (Dashboard, BoardDetail).
- **GuestRoute:** If `isAuthenticated`, redirect to `/dashboard`; otherwise render Login or Register.
- **Routes:** `/login`, `/register`, `/dashboard`, `/boards/:boardId`, `/` → dashboard, `*` → login.

---

## 7. Summary: what was done and how to use it

| Area | What’s done | How you use it |
|------|-------------|----------------|
| **Auth** | authSlice holds token/user; Login/Register call API then setCredentials; Nav shows user and Logout | Read `isAuthenticated` and `user`; dispatch `setCredentials` / `clearCredentials`. |
| **Boards list** | boardsSlice + fetchBoards, createBoard, removeBoard | Dispatch thunks from Dashboard; read `items`, `total`, `loading`, `error`. |
| **Board detail** | boardDetailSlice + fetchBoardDetail, CRUD for lists/cards, moveCardThunk + moveCardLocal | Dispatch fetchBoardDetail with boardId and params; dispatch addList, addCard, updateCard, removeCard, removeList, moveCardThunk (+ moveCardLocal for instant drag UI). Read `board`, `lists`, `loading`, `error`. |
| **API** | kanbanApi.ts with axios + interceptors | Use from thunks or from pages (e.g. login); use getApiError for toasts. |

You do **not** need to write raw actions or reducer logic for normal features; you:

1. **Read** with `useAppSelector`.
2. **Dispatch** existing thunks or actions with `useAppDispatch`.
3. Optionally add new thunks in the right slice and new API functions in `kanbanApi.ts` if you add new endpoints.

This keeps all “how the data is stored and updated” in the store and slices, and components stay simple: dispatch and display.
