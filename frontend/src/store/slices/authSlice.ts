import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { User } from '../../api/kanbanApi';

const AUTH_USER_KEY = 'authUser';

function getStoredUser(): { _id: string; email?: string; name?: string } | null {
  try {
    const raw = localStorage.getItem(AUTH_USER_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { _id: string; email?: string; name?: string };
    return parsed && parsed._id ? parsed : null;
  } catch {
    return null;
  }
}

const token = localStorage.getItem('token');
const storedUser = token ? getStoredUser() : null;

interface AuthState {
  token: string | null;
  user: { _id: string; email?: string; name?: string } | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  token: token || null,
  user: storedUser || (token ? { _id: localStorage.getItem('userId') || '' } : null),
  isAuthenticated: !!token,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: User; token: string }>
    ) => {
      const user = action.payload.user;
      const toStore = { _id: user._id, email: user.email, name: user.name };
      state.token = action.payload.token;
      state.user = toStore;
      state.isAuthenticated = true;
      localStorage.setItem('token', action.payload.token);
      localStorage.setItem('userId', user._id);
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(toStore));
    },
    clearCredentials: (state) => {
      state.token = null;
      state.user = null;
      state.isAuthenticated = false;
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      localStorage.removeItem(AUTH_USER_KEY);
    },
  },
});

export const { setCredentials, clearCredentials } = authSlice.actions;
export default authSlice.reducer;
