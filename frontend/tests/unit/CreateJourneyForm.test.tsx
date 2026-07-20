import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { CreateJourneyForm } from '../../src/features/partners/CreateJourneyForm';
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

const PARIS = { id: 'city-1', name: 'Paris', country: 'France', latitude: 48.85, longitude: 2.35, google_place_id: null };

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}

describe('CreateJourneyForm', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (input: RequestInfo | URL) => {
        const url = input instanceof Request ? input.url : input.toString();

        if (url.includes('/cities')) {
          return jsonResponse({ data: [PARIS] });
        }

        if (url.includes('/journeys')) {
          return jsonResponse(
            {
              data: {
                id: 'journey-1',
                title: 'Origins of Paris',
                description: null,
                city: PARIS,
                city_id: PARIS.id,
                status: 'draft',
                created_by: 'user-1',
                stops: [],
                created_at: new Date().toISOString(),
              },
            },
            201
          );
        }

        throw new Error(`Unhandled request: ${url}`);
      })
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('starts with two stop rows and lets you add more', async () => {
    const user = userEvent.setup();

    render(
      <Provider store={buildStore()}>
        <MemoryRouter>
          <CreateJourneyForm />
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getAllByText('Year')).toHaveLength(2);
    await user.click(screen.getByText('+ Add another stop'));
    expect(screen.getAllByText('Year')).toHaveLength(3);
  });

  it('disables submit until a title and city are set', async () => {
    const user = userEvent.setup();

    render(
      <Provider store={buildStore()}>
        <MemoryRouter>
          <CreateJourneyForm />
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByRole('button', { name: 'Create Journey' })).toBeDisabled();

    await user.type(screen.getByLabelText('Title'), 'Origins of Paris');
    await user.type(screen.getByLabelText('Search for a city'), 'Par');
    await waitFor(() => screen.getByText('Paris, France'));
    await user.click(screen.getByText('Paris, France'));

    expect(screen.getByRole('button', { name: 'Create Journey' })).toBeEnabled();
  });

  it('creates the journey and navigates to it on success', async () => {
    const user = userEvent.setup();

    render(
      <Provider store={buildStore()}>
        <MemoryRouter initialEntries={['/partner-dashboard']}>
          <Routes>
            <Route path="/partner-dashboard" element={<CreateJourneyForm />} />
            <Route path="/journeys/:id" element={<div>Journey Detail Page</div>} />
          </Routes>
        </MemoryRouter>
      </Provider>
    );

    await user.type(screen.getByLabelText('Title'), 'Origins of Paris');
    await user.type(screen.getByLabelText('Search for a city'), 'Par');
    await waitFor(() => screen.getByText('Paris, France'));
    await user.click(screen.getByText('Paris, France'));

    await user.click(screen.getByRole('button', { name: 'Create Journey' }));

    await waitFor(() => {
      expect(screen.getByText('Journey Detail Page')).toBeInTheDocument();
    });
  });

  it('cannot remove stops below the 2-stop minimum', () => {
    render(
      <Provider store={buildStore()}>
        <MemoryRouter>
          <CreateJourneyForm />
        </MemoryRouter>
      </Provider>
    );

    const removeButtons = screen.getAllByRole('button', { name: 'Remove' });
    expect(removeButtons).toHaveLength(2);
    removeButtons.forEach((btn) => expect(btn).toBeDisabled());
  });
});
