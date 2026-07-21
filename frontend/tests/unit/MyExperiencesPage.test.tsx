import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import { MyExperiencesPage } from '../../src/features/experience/MyExperiencesPage';
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
        <MyExperiencesPage />
      </MemoryRouter>
    </Provider>,
  );
}

describe('MyExperiencesPage', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('shows an empty state when the partner has created nothing yet', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => jsonResponse({ data: [] })));

    renderPage();

    await waitFor(() => {
      expect(screen.getByText(/haven't created any experiences yet/i)).toBeInTheDocument();
    });
  });

  it('renders a card per owned experience, including drafts', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        jsonResponse({
          data: [
            {
              id: 'exp-1',
              city: { id: 'c1', name: 'Vaasa', country: 'Finland', latitude: 63, longitude: 21, google_place_id: null },
              city_id: 'c1',
              year: 1852,
              era_label: 'The Great Fire',
              status: 'draft',
              created_by: 'partner-1',
              approved_by: null,
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
      expect(screen.getByText('Vaasa, 1852')).toBeInTheDocument();
    });
    expect(screen.getByText('Draft')).toBeInTheDocument();
  });
});
