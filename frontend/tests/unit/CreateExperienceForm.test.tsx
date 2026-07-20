import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { CreateExperienceForm } from '../../src/features/explorer/CreateExperienceForm';
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

function jsonResponse(body: unknown, status = 201) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}

describe('CreateExperienceForm', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('submits city_id, year, era_label, and google_maps_link, then navigates to the new experience', async () => {
    let capturedBody: unknown = null;

    vi.stubGlobal(
      'fetch',
      vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
        capturedBody = input instanceof Request
          ? await input.clone().json()
          : init?.body
            ? JSON.parse(init.body as string)
            : null;
        return jsonResponse({
          data: {
            id: 'exp-99',
            city: {},
            city_id: 'city-1',
            year: 1889,
            era_label: 'Belle Époque',
            status: 'draft',
            created_by: 'user-1',
            approved_by: null,
            google_maps_link: 'https://www.google.com/maps/place/Eiffel+Tower',
            pin_latitude: null,
            pin_longitude: null,
            pin_place_name: null,
            story_content: {},
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        });
      })
    );

    const user = userEvent.setup();

    render(
      <Provider store={buildStore()}>
        <MemoryRouter initialEntries={['/explorer']}>
          <Routes>
            <Route path="/explorer" element={<CreateExperienceForm cityId="city-1" year={1889} />} />
            <Route path="/experiences/:id" element={<div>Experience Detail Page</div>} />
          </Routes>
        </MemoryRouter>
      </Provider>
    );

    await user.type(screen.getByLabelText('Era label (optional)'), 'Belle Époque');
    await user.type(
      screen.getByLabelText('Google Maps link (optional)'),
      'https://www.google.com/maps/place/Eiffel+Tower'
    );
    await user.click(screen.getByRole('button', { name: 'Create TimeCapsule' }));

    await waitFor(() => {
      expect(screen.getByText('Experience Detail Page')).toBeInTheDocument();
    });

    expect(capturedBody).toMatchObject({
      city_id: 'city-1',
      year: 1889,
      era_label: 'Belle Époque',
      google_maps_link: 'https://www.google.com/maps/place/Eiffel+Tower',
    });
  });

  it('submits without era_label/google_maps_link when left blank', async () => {
    let capturedBody: { era_label?: string; google_maps_link?: string } | null = null;

    vi.stubGlobal(
      'fetch',
      vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
        capturedBody = input instanceof Request
          ? await input.clone().json()
          : init?.body
            ? JSON.parse(init.body as string)
            : null;
        return jsonResponse({
          data: {
            id: 'exp-100',
            city: {},
            city_id: 'city-1',
            year: 2020,
            era_label: null,
            status: 'draft',
            created_by: 'user-1',
            approved_by: null,
            google_maps_link: null,
            pin_latitude: null,
            pin_longitude: null,
            pin_place_name: null,
            story_content: {},
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        });
      })
    );

    const user = userEvent.setup();

    render(
      <Provider store={buildStore()}>
        <MemoryRouter initialEntries={['/explorer']}>
          <Routes>
            <Route path="/explorer" element={<CreateExperienceForm cityId="city-1" year={2020} />} />
            <Route path="/experiences/:id" element={<div>Experience Detail Page</div>} />
          </Routes>
        </MemoryRouter>
      </Provider>
    );

    await user.click(screen.getByRole('button', { name: 'Create TimeCapsule' }));

    await waitFor(() => {
      expect(screen.getByText('Experience Detail Page')).toBeInTheDocument();
    });

    expect(capturedBody).toMatchObject({ city_id: 'city-1', year: 2020 });
    expect(capturedBody?.era_label).toBeUndefined();
    expect(capturedBody?.google_maps_link).toBeUndefined();
  });
});
