import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import App from '../../src/App';
import authReducer from '../../src/features/auth/authSlice';
import { apiClient } from '../../src/api/client';

function buildStore(preloadedState = {}) {
  return configureStore({
    reducer: {
      auth: authReducer,
      [apiClient.reducerPath]: apiClient.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(apiClient.middleware),
    preloadedState,
  });
}

describe('App shell', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('redirects an unauthenticated visitor to the login page', async () => {
    window.history.pushState({}, 'Test page', '/explorer');

    const store = buildStore({
      auth: {
        user: null,
        token: null,
      },
    });

    render(
      <Provider store={store}>
        <App />
      </Provider>,
    );

    const heading = await screen.findByRole('heading', { name: /welcome back/i });
    expect(heading).toBeInTheDocument();
  });
});