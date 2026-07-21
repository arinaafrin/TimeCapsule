import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import { AdminDashboardPage } from '../../src/features/admin/AdminDashboardPage';
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

const sampleStats = {
  data: {
    users: { total: 9, by_role: { visitor: 5, partner: 3, admin: 1 } },
    cities: { total: 6 },
    experiences: {
      total: 7,
      by_status: { draft: 2, pending_review: 1, approved: 4, rejected: 0, archived: 0 },
    },
    journeys: { total: 1, by_status: { draft: 0, pending_review: 0, published: 1 } },
    ai_generation_jobs: {
      total: 6,
      by_status: { queued: 1, processing: 0, completed: 5, failed: 0 },
      recent_failures: [],
    },
    favorites: { total: 5 },
    partner_organizations: { total: 5, verified: 2, pending: 3 },
    recent_moderation_activity: [
      {
        id: 'log-1',
        action: 'approved',
        notes: 'Looks good',
        reviewer_name: 'Ada Curator',
        experience_id: 'exp-1',
        era_label: 'Belle Époque',
        city: 'Paris',
        created_at: new Date().toISOString(),
      },
    ],
  },
};

describe('AdminDashboardPage', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('renders aggregate stat cards from the API', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => jsonResponse(sampleStats)));

    render(
      <Provider store={buildStore()}>
        <MemoryRouter>
          <AdminDashboardPage />
        </MemoryRouter>
      </Provider>,
    );

    await waitFor(() => {
      expect(screen.getByText('9')).toBeInTheDocument(); // total users
    });
    expect(screen.getByText('Cities')).toBeInTheDocument();
    expect(screen.getByText('Experiences')).toBeInTheDocument();
    expect(screen.getByText(/Recent moderation activity/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Ada Curator/).length).toBeGreaterThan(0);
  });

  it('shows an error message when stats fail to load', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('Forbidden', { status: 403 })));

    render(
      <Provider store={buildStore()}>
        <MemoryRouter>
          <AdminDashboardPage />
        </MemoryRouter>
      </Provider>,
    );

    await waitFor(() => {
      expect(screen.getByText(/Could not load admin stats/i)).toBeInTheDocument();
    });
  });
});
