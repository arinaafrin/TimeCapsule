import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { ProtectedRoute } from '../../src/routes/ProtectedRoute';
import authReducer from '../../src/features/auth/authSlice';
import type { User } from '../../src/types/user';

function renderWithAuth(user: User | null, token: string | null) {
  const store = configureStore({
    reducer: { auth: authReducer },
    preloadedState: { auth: { user, token } },
  });

  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={['/explorer']}>
        <Routes>
          <Route path="/login" element={<div>Login Page</div>} />
          <Route
            path="/explorer"
            element={
              <ProtectedRoute>
                <div>Explorer Page</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    </Provider>,
  );
}

describe('ProtectedRoute', () => {
  it('redirects to /login when there is no token', () => {
    renderWithAuth(null, null);
    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });

  it('renders the protected content when a token is present', () => {
    renderWithAuth(
      { id: '1', name: 'Ada', email: 'ada@example.com', role: 'visitor' },
      'abc123',
    );
    expect(screen.getByText('Explorer Page')).toBeInTheDocument();
  });
});
