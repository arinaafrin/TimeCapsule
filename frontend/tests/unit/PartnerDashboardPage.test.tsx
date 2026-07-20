import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { PartnerDashboardPage } from '../../src/features/partners/PartnerDashboardPage';
import authReducer from '../../src/features/auth/authSlice';
import { apiClient } from '../../src/api/client';
import type { User } from '../../src/types/user';

function buildStore(user: User) {
  return configureStore({
    reducer: {
      auth: authReducer,
      [apiClient.reducerPath]: apiClient.reducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(apiClient.middleware),
    preloadedState: {
      auth: { user, token: 'test-token' },
    },
  });
}

function jsonResponse(body: unknown) {
  return new Response(JSON.stringify(body), { status: 200, headers: { 'Content-Type': 'application/json' } });
}

function mockFetchByUrl(organizations: unknown[]) {
  return vi.fn(async (input: RequestInfo | URL) => {
    const url = input instanceof Request ? input.url : input.toString();

    if (url.includes('/partner-organizations')) {
      return jsonResponse({ data: organizations });
    }
    if (url.includes('/cities')) {
      return jsonResponse({ data: [] });
    }

    return jsonResponse({ data: [] });
  });
}

const partnerUser: User = { id: 'partner-1', name: 'Partner One', email: 'p1@test.com', role: 'partner' };
const adminUser: User = { id: 'admin-1', name: 'Admin One', email: 'a1@test.com', role: 'admin' };

describe('PartnerDashboardPage', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('shows the registration form for a partner and lists their organizations', async () => {
    vi.stubGlobal(
      'fetch',
      mockFetchByUrl([{ id: 'org-1', name: 'Louvre Digital Team', contact_user_id: 'partner-1', verified: false }]),
    );

    render(
      <Provider store={buildStore(partnerUser)}>
        <MemoryRouter>
          <PartnerDashboardPage />
        </MemoryRouter>
      </Provider>,
    );

    expect(screen.getByText('Register a new organization')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Louvre Digital Team')).toBeInTheDocument();
    });
    expect(screen.getByText('Pending verification')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Verify' })).not.toBeInTheDocument();
  });

  it('shows a Verify button for admins on unverified organizations', async () => {
    vi.stubGlobal(
      'fetch',
      mockFetchByUrl([{ id: 'org-1', name: 'Colosseum Archive', contact_user_id: 'partner-2', verified: false }]),
    );

    render(
      <Provider store={buildStore(adminUser)}>
        <MemoryRouter>
          <PartnerDashboardPage />
        </MemoryRouter>
      </Provider>,
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Verify' })).toBeInTheDocument();
    });
    expect(screen.queryByText('Register a new organization')).not.toBeInTheDocument();
  });
});
