import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import * as kanbanApi from '../../api/kanbanApi';
import type { Board, List, Card } from '../../api/kanbanApi';

interface BoardDetailState {
  board: Board | null;
  lists: List[];
  totalLists: number;
  totalPages: number;
  loading: boolean;
  error: string | null;
}

const initialState: BoardDetailState = {
  board: null,
  lists: [],
  totalLists: 0,
  totalPages: 0,
  loading: false,
  error: null,
};

export const fetchBoardDetail = createAsyncThunk(
  'boardDetail/fetchBoardDetail',
  async (
    payload: string | {
      boardId: string;
      params?: { q?: string; status?: string; listPage?: number; listLimit?: number };
    },
    { rejectWithValue }
  ) => {
    try {
      const boardId = typeof payload === 'string' ? payload : payload.boardId;
      const params = typeof payload === 'string' ? undefined : payload.params;
      return await kanbanApi.getBoard(boardId, params);
    } catch (err) {
      return rejectWithValue(kanbanApi.getApiError(err));
    }
  }
);

export const addList = createAsyncThunk(
  'boardDetail/addList',
  async ({ boardId, title }: { boardId: string; title: string }, { rejectWithValue }) => {
    try {
      const { list } = await kanbanApi.createList(boardId, title);
      return list;
    } catch (err) {
      return rejectWithValue(kanbanApi.getApiError(err));
    }
  }
);

export const updateListTitle = createAsyncThunk(
  'boardDetail/updateListTitle',
  async (
    { boardId, listId, title }: { boardId: string; listId: string; title: string },
    { rejectWithValue }
  ) => {
    try {
      const { list } = await kanbanApi.updateList(boardId, listId, { title });
      return list;
    } catch (err) {
      return rejectWithValue(kanbanApi.getApiError(err));
    }
  }
);

export const removeList = createAsyncThunk(
  'boardDetail/removeList',
  async (
    { boardId, listId }: { boardId: string; listId: string },
    { rejectWithValue }
  ) => {
    try {
      await kanbanApi.deleteList(boardId, listId);
      return listId;
    } catch (err) {
      return rejectWithValue(kanbanApi.getApiError(err));
    }
  }
);

export const addCard = createAsyncThunk(
  'boardDetail/addCard',
  async (
    { boardId, listId, title, dueDate, status }: { boardId: string; listId: string; title: string; dueDate?: string; status?: string },
    { rejectWithValue }
  ) => {
    try {
      const { card } = await kanbanApi.createCard(boardId, listId, { title, dueDate, status });
      return card;
    } catch (err) {
      return rejectWithValue(kanbanApi.getApiError(err));
    }
  }
);

export const updateCard = createAsyncThunk(
  'boardDetail/updateCard',
  async (
    { cardId, body }: { cardId: string; body: { title?: string; dueDate?: string | null; status?: string } },
    { rejectWithValue }
  ) => {
    try {
      const { card } = await kanbanApi.updateCard(cardId, body);
      return card;
    } catch (err) {
      return rejectWithValue(kanbanApi.getApiError(err));
    }
  }
);

export const removeCard = createAsyncThunk(
  'boardDetail/removeCard',
  async (cardId: string, { rejectWithValue }) => {
    try {
      await kanbanApi.deleteCard(cardId);
      return cardId;
    } catch (err) {
      return rejectWithValue(kanbanApi.getApiError(err));
    }
  }
);

export const moveCardThunk = createAsyncThunk(
  'boardDetail/moveCard',
  async (
    { cardId, listId, position }: { cardId: string; listId: string; position: number },
    { rejectWithValue }
  ) => {
    try {
      const { card } = await kanbanApi.moveCard(cardId, listId, position);
      return card;
    } catch (err) {
      return rejectWithValue(kanbanApi.getApiError(err));
    }
  }
);

function updateCardInLists(lists: List[], card: Card): List[] {
  return lists.map((list) => {
    if (list._id !== card.listId) {
      const without = list.cards.filter((c) => c._id !== card._id);
      if (without.length !== list.cards.length) return { ...list, cards: without };
      return list;
    }
    const idx = list.cards.findIndex((c) => c._id === card._id);
    const cards = [...list.cards];
    if (idx >= 0) cards[idx] = card;
    else cards.push(card);
    cards.sort((a, b) => a.order - b.order);
    return { ...list, cards };
  });
}

const boardDetailSlice = createSlice({
  name: 'boardDetail',
  initialState,
  reducers: {
    clearBoardDetail: (state) => {
      state.board = null;
      state.lists = [];
      state.totalLists = 0;
      state.totalPages = 0;
      state.error = null;
    },
    setLists: (state, action: PayloadAction<List[]>) => {
      state.lists = action.payload;
    },
    moveCardLocal: (state, action: PayloadAction<{ cardId: string; fromListId: string; toListId: string; toIndex: number }>) => {
      const { cardId, fromListId, toListId, toIndex } = action.payload;
      const fromList = state.lists.find((l) => l._id === fromListId);
      const toList = state.lists.find((l) => l._id === toListId);
      if (!fromList || !toList) return;
      const card = fromList.cards.find((c) => c._id === cardId);
      if (!card) return;
      const fromCards = fromList.cards.filter((c) => c._id !== cardId);
      const sameList = fromListId === toListId;
      const reordered = sameList ? [...fromCards] : [...toList.cards];
      const insertIndex = sameList ? Math.min(toIndex, fromCards.length) : Math.min(toIndex, toList.cards.length);
      reordered.splice(insertIndex, 0, { ...card, listId: toListId, order: insertIndex });
      const reorderedWithOrder = reordered.map((c, i) => ({ ...c, order: i }));
      state.lists = state.lists.map((l) => {
        if (l._id === fromListId && sameList) return { ...l, cards: reorderedWithOrder };
        if (l._id === fromListId) return { ...l, cards: fromCards };
        if (l._id === toListId) return { ...l, cards: reorderedWithOrder };
        return l;
      });
    },
    addCardLocal: (state, action: PayloadAction<{ listId: string; card: Card }>) => {
      const { listId, card } = action.payload;
      state.lists = state.lists.map((l) =>
        l._id === listId ? { ...l, cards: [...l.cards, card].sort((a, b) => a.order - b.order) } : l
      );
    },
    updateCardLocal: (state, action: PayloadAction<Card>) => {
      state.lists = updateCardInLists(state.lists, action.payload);
    },
    removeCardLocal: (state, action: PayloadAction<{ listId: string; cardId: string }>) => {
      const { listId, cardId } = action.payload;
      state.lists = state.lists.map((l) =>
        l._id === listId ? { ...l, cards: l.cards.filter((c) => c._id !== cardId) } : l
      );
    },
    addListLocal: (state, action: PayloadAction<List>) => {
      state.lists.push(action.payload);
    },
    removeListLocal: (state, action: PayloadAction<string>) => {
      state.lists = state.lists.filter((l) => l._id !== action.payload);
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBoardDetail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBoardDetail.fulfilled, (state, action) => {
        state.loading = false;
        state.board = action.payload.board;
        state.lists = action.payload.lists;
        state.totalLists = action.payload.totalLists;
        state.totalPages = action.payload.totalPages;
      })
      .addCase(fetchBoardDetail.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || 'Failed to load board';
      })
      .addCase(addList.fulfilled, (state, action) => {
        state.lists.push({ ...action.payload, cards: [] });
      })
      .addCase(updateListTitle.fulfilled, (state, action) => {
        const list = state.lists.find((l) => l._id === action.payload._id);
        if (list) list.title = action.payload.title;
      })
      .addCase(removeList.fulfilled, (state, action) => {
        state.lists = state.lists.filter((l) => l._id !== action.payload);
        state.totalLists = Math.max(0, state.totalLists - 1);
        if (state.totalLists === 0) state.totalPages = 0;
      })
      .addCase(addCard.fulfilled, (state, action) => {
        state.lists = updateCardInLists(state.lists, action.payload);
      })
      .addCase(updateCard.fulfilled, (state, action) => {
        state.lists = updateCardInLists(state.lists, action.payload);
      })
      .addCase(removeCard.fulfilled, (state, action) => {
        state.lists = state.lists.map((l) => ({
          ...l,
          cards: l.cards.filter((c) => c._id !== action.payload),
        }));
      })
      .addCase(moveCardThunk.fulfilled, (state, action) => {
        state.lists = updateCardInLists(state.lists, action.payload);
      });
  },
});

export const {
  clearBoardDetail,
  setLists,
  moveCardLocal,
  addCardLocal,
  updateCardLocal,
  removeCardLocal,
  addListLocal,
  removeListLocal,
  clearError,
} = boardDetailSlice.actions;
export default boardDetailSlice.reducer;
