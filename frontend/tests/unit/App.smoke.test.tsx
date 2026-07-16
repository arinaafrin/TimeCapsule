import { describe, it, expect, beforeEach } from 'vitest';
// Adds jest-dom matchers like toBeInTheDocument for improved assertions
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom'; // 1. Added MemoryRouter
import { configureStore } from '@reduxjs/toolkit';
import App from '../../src/App';
import authReducer from '../../src/features/auth/authSlice';
import { apiClient } from '../../src/api/client';

// Helper to construct the store with a customizable preloaded state
function buildStore(preloadedState = {}) {
  return configureStore({
    reducer: {
      auth: authReducer,
      [apiClient.reducerPath]: apiClient.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(apiClient.middleware),
    preloadedState, // 2. Allows us to inject specific auth states
  });
}

describe('App shell', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('redirects an unauthenticated visitor to the login page', async () => {
    // 3. Force an unauthenticated/empty auth state
    const store = buildStore({
      auth: {
        user: null,
        token: null,
        isAuthenticated: false, // Ensure this matches your authSlice structure
      },
    });

    render(
      <Provider store={store}>
        {/* 4. If App.tsx does NOT have an internal Router wrapper, wrap it here.
             If App.tsx already contains its own <RouterProvider>, you don't need MemoryRouter,
             but you must ensure the unauthenticated store state (above) triggers the redirect.
        */}
        <MemoryRouter initialEntries={['/']}>
          <App />
        </MemoryRouter>
      </Provider>,
    );

    // 5. Use findByRole (async) because redirects can take a microtask to settle
    const heading = await screen.findByRole('heading', { name: /welcome back/i });
    expect(heading).toBeInTheDocument();
  });
});