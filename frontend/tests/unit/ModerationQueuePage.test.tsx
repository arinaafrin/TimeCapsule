import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { ModerationQueuePage } from '../../src/features/moderation/ModerationQueuePage';
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

describe('ModerationQueuePage', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('shows an empty state when nothing is pending review', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => jsonResponse({ data: [] })));

    render(
      <Provider store={buildStore()}>
        <ModerationQueuePage />
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('Nothing pending review right now.')).toBeInTheDocument();
    });
  });

  it('renders a review card for each pending experience', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        jsonResponse({
          data: [
            {
              id: 'exp-1',
              city: { id: 'c1', name: 'Cairo', country: 'Egypt', latitude: 30, longitude: 31, google_place_id: null },
              city_id: 'c1',
              year: 1920,
              era_label: null,
              status: 'pending_review',
              created_by: 'u1',
              approved_by: null,
              google_maps_link: null,
              story_content: {},
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          ],
        })
      )
    );

    render(
      <Provider store={buildStore()}>
        <ModerationQueuePage />
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('Cairo, 1920')).toBeInTheDocument();
    });
  });
});
