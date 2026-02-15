import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import * as kanbanApi from '../../api/kanbanApi';
import type { Board } from '../../api/kanbanApi';

interface BoardsState {
  items: Board[];
  total: number;
  loading: boolean;
  error: string | null;
}

const initialState: BoardsState = {
  items: [],
  total: 0,
  loading: false,
  error: null,
};

export const fetchBoards = createAsyncThunk(
  'boards/fetchBoards',
  async (_, { rejectWithValue }) => {
    try {
      const data = await kanbanApi.getBoards();
      return { boards: data.boards, total: data.total };
    } catch (err) {
      return rejectWithValue(kanbanApi.getApiError(err));
    }
  }
);

export const createBoard = createAsyncThunk(
  'boards/createBoard',
  async (title: string, { rejectWithValue }) => {
    try {
      const { board } = await kanbanApi.createBoard(title);
      return board;
    } catch (err) {
      return rejectWithValue(kanbanApi.getApiError(err));
    }
  }
);

export const removeBoard = createAsyncThunk(
  'boards/removeBoard',
  async (boardId: string, { rejectWithValue }) => {
    try {
      await kanbanApi.deleteBoard(boardId);
      return boardId;
    } catch (err) {
      return rejectWithValue(kanbanApi.getApiError(err));
    }
  }
);

const boardsSlice = createSlice({
  name: 'boards',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearBoards: (state) => {
      state.items = [];
      state.total = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBoards.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBoards.fulfilled, (state, action: PayloadAction<{ boards: Board[]; total: number }>) => {
        state.loading = false;
        state.items = action.payload.boards;
        state.total = action.payload.total;
      })
      .addCase(fetchBoards.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || 'Failed to load boards';
      })
      .addCase(createBoard.fulfilled, (state, action: PayloadAction<Board>) => {
        state.items.unshift(action.payload);
        state.total += 1;
      })
      .addCase(createBoard.rejected, (state, action) => {
        state.error = (action.payload as string) || 'Failed to create board';
      })
      .addCase(removeBoard.fulfilled, (state, action: PayloadAction<string>) => {
        state.items = state.items.filter((b) => b._id !== action.payload);
        state.total = Math.max(0, state.total - 1);
      })
      .addCase(removeBoard.rejected, (state, action) => {
        state.error = (action.payload as string) || 'Failed to delete board';
      });
  },
});

export const { clearError, clearBoards } = boardsSlice.actions;
export default boardsSlice.reducer;
