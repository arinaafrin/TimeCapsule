import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { User } from '../../types/user';

const TOKEN_STORAGE_KEY = 'timecapsule_auth_token';

interface AuthState {
  user: User | null;
  token: string | null;
}

const initialState: AuthState = {
  user: null,
  token: typeof window !== 'undefined' ? window.localStorage.getItem(TOKEN_STORAGE_KEY) : null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    credentialsReceived: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      window.localStorage.setItem(TOKEN_STORAGE_KEY, action.payload.token);
    },
    userLoaded: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },
    loggedOut: (state) => {
      state.user = null;
      state.token = null;
      window.localStorage.removeItem(TOKEN_STORAGE_KEY);
    },
  },
});

export const { credentialsReceived, userLoaded, loggedOut } = authSlice.actions;
export default authSlice.reducer;

export const selectIsAuthenticated = (state: { auth: AuthState }) => Boolean(state.auth.token);
export const selectCurrentUser = (state: { auth: AuthState }) => state.auth.user;
export const selectUserRole = (state: { auth: AuthState }) => state.auth.user?.role ?? null;
