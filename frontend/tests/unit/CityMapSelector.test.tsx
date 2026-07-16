import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { CityMapSelector } from '../../src/features/explorer/CityMapSelector';
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

const PARIS = { id: 'city-1', name: 'Paris', country: 'France', latitude: 48.8566, longitude: 2.3522, google_place_id: 'p1' };

describe('CityMapSelector', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        new Response(JSON.stringify({ data: [PARIS] }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      )
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('shows search results and calls onCitySelect when a result is clicked', async () => {
    const user = userEvent.setup();
    const handleSelect = vi.fn();

    render(
      <Provider store={buildStore()}>
        <CityMapSelector selectedCity={null} onCitySelect={handleSelect} />
      </Provider>
    );

    await user.type(screen.getByLabelText('Search for a city'), 'Par');

    await waitFor(() => {
      expect(screen.getByText('Paris, France')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Paris, France'));

    expect(handleSelect).toHaveBeenCalledWith(PARIS);
  });

  it('renders the coordinate fallback panel when a city is selected and no Maps API key is configured', () => {
    render(
      <Provider store={buildStore()}>
        <CityMapSelector selectedCity={PARIS} onCitySelect={vi.fn()} />
      </Provider>
    );

    expect(screen.getByTestId('map-fallback')).toHaveTextContent('Paris');
  });
});
