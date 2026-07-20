import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import { FavoritesPage } from '../../src/features/favorites/FavoritesPage';
import authReducer from '../../src/features/auth/authSlice';
import { apiClient } from '../../src/api/client';

function buildStore() {
  return configureStore({
    reducer: {
      auth: authReducer,
      [apiClient.reducerPath]: apiClient.reducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(apiClient.middleware),
  });
}

function jsonResponse(body: unknown) {
  return new Response(JSON.stringify(body), { status: 200, headers: { 'Content-Type': 'application/json' } });
}

function renderPage() {
  render(
    <Provider store={buildStore()}>
      <MemoryRouter>
        <FavoritesPage />
      </MemoryRouter>
    </Provider>,
  );
}

describe('FavoritesPage', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('shows an empty state when there are no favorites', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => jsonResponse({ data: [] })));

    renderPage();

    await waitFor(() => {
      expect(screen.getByText(/haven't favorited any TimeCapsules/i)).toBeInTheDocument();
    });
  });

  it('renders a card for each favorited experience', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        jsonResponse({
          data: [
            {
              id: 'exp-1',
              city: { id: 'c1', name: 'Paris', country: 'France', latitude: 48, longitude: 2, google_place_id: null },
              city_id: 'c1',
              year: 1889,
              era_label: 'Belle Époque',
              status: 'approved',
              created_by: 'u1',
              approved_by: 'admin-1',
              google_maps_link: null,
              story_content: {},
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          ],
        }),
      ),
    );

    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Paris, 1889')).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: 'Remove' })).toBeInTheDocument();
  });
});
