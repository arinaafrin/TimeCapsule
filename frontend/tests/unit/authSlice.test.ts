import { describe, it, expect, beforeEach } from 'vitest';
import authReducer, {
  credentialsReceived,
  loggedOut,
  selectIsAuthenticated,
  selectCurrentUser,
  selectUserRole,
} from '../../src/features/auth/authSlice';
import type { User } from '../../src/types/user';

const mockUser: User = {
  id: 'user-1',
  name: 'Ada Lovelace',
  email: 'ada@example.com',
  role: 'visitor',
};

describe('authSlice', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('has no user or token by default', () => {
    const state = authReducer(undefined, { type: '@@INIT' });
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
  });

  it('stores the user and token on credentialsReceived', () => {
    const state = authReducer(
      { user: null, token: null },
      credentialsReceived({ user: mockUser, token: 'abc123' }),
    );

    expect(state.user).toEqual(mockUser);
    expect(state.token).toBe('abc123');
    expect(window.localStorage.getItem('timecapsule_auth_token')).toBe('abc123');
  });

  it('clears the user and token on loggedOut', () => {
    const authenticated = { user: mockUser, token: 'abc123' };
    window.localStorage.setItem('timecapsule_auth_token', 'abc123');

    const state = authReducer(authenticated, loggedOut());

    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
    expect(window.localStorage.getItem('timecapsule_auth_token')).toBeNull();
  });

  it('selectIsAuthenticated reflects whether a token is present', () => {
    expect(selectIsAuthenticated({ auth: { user: null, token: null } })).toBe(false);
    expect(selectIsAuthenticated({ auth: { user: mockUser, token: 'abc123' } })).toBe(true);
  });

  it('selectCurrentUser and selectUserRole read from state', () => {
    const state = { auth: { user: mockUser, token: 'abc123' } };
    expect(selectCurrentUser(state)).toEqual(mockUser);
    expect(selectUserRole(state)).toBe('visitor');
  });
});
