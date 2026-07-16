import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { ModerationReviewCard } from '../../src/features/moderation/ModerationReviewCard';
import authReducer from '../../src/features/auth/authSlice';
import { apiClient } from '../../src/api/client';
import type { Experience } from '../../src/types/experience';

function buildStore() {
  return configureStore({
    reducer: {
      auth: authReducer,
      [apiClient.reducerPath]: apiClient.reducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(apiClient.middleware),
  });
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}

const EXPERIENCE: Experience = {
  id: 'exp-1',
  city: { id: 'city-1', name: 'Rome', country: 'Italy', latitude: 41.9, longitude: 12.5, google_place_id: null },
  city_id: 'city-1',
  year: 1600,
  era_label: 'Renaissance',
  status: 'pending_review',
  created_by: 'user-2',
  approved_by: null,
  google_maps_link: null,
  story_content: { description: 'A summary of Renaissance Rome.' } as never,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

describe('ModerationReviewCard', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('approves an experience', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => jsonResponse({ data: { ...EXPERIENCE, status: 'approved' } })));
    const user = userEvent.setup();

    render(
      <Provider store={buildStore()}>
        <ModerationReviewCard experience={EXPERIENCE} />
      </Provider>
    );

    expect(screen.getByText('Rome, 1600')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Approve' }));

    await waitFor(() => {
      expect(vi.mocked(fetch)).toHaveBeenCalled();
    });
  });

  it('requires notes before confirming a rejection', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => jsonResponse({ data: EXPERIENCE })));
    const user = userEvent.setup();

    render(
      <Provider store={buildStore()}>
        <ModerationReviewCard experience={EXPERIENCE} />
      </Provider>
    );

    await user.click(screen.getByRole('button', { name: 'Reject' }));
    expect(screen.getByRole('button', { name: 'Confirm reject' })).toBeDisabled();

    await user.type(screen.getByPlaceholderText('Explain why this is being rejected...'), 'Inaccurate dates');
    expect(screen.getByRole('button', { name: 'Confirm reject' })).toBeEnabled();
  });

  it('posts a comment without approving or rejecting', async () => {
    const fetchMock = vi.fn(async () => jsonResponse({ id: 'log-1' }, 201));
    vi.stubGlobal('fetch', fetchMock);
    const user = userEvent.setup();

    render(
      <Provider store={buildStore()}>
        <ModerationReviewCard experience={EXPERIENCE} />
      </Provider>
    );

    await user.click(screen.getByRole('button', { name: 'Comment' }));
    await user.type(screen.getByPlaceholderText('Add a comment...'), 'Double check the year.');
    await user.click(screen.getByRole('button', { name: 'Post comment' }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalled();
    });
  });
});
