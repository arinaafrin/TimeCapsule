import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../../src/features/auth/authSlice';
import { apiClient } from '../../src/api/client';
import type { Journey } from '../../src/types/journey';

vi.mock('@react-three/fiber', () => ({
  Canvas: ({ children }: { children: React.ReactNode }) => <div data-testid="mock-canvas">{children}</div>,
}));
vi.mock('@react-three/drei', () => ({
  OrbitControls: () => null,
  useTexture: () => ({ colorSpace: '' }),
  PositionalAudio: () => null,
}));
vi.mock('@react-three/xr', () => ({
  XR: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  XROrigin: () => null,
  createXRStore: () => ({ enterVR: vi.fn() }),
  useXRSessionModeSupported: () => false,
  useXRInputSourceState: () => undefined,
  useXRInputSourceEvent: () => {},
}));

import { JourneyViewer } from '../../src/features/viewer/JourneyViewer';

function buildStore() {
  return configureStore({
    reducer: {
      auth: authReducer,
      [apiClient.reducerPath]: apiClient.reducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(apiClient.middleware),
  });
}

function makeJourney(): Journey {
  return {
    id: 'journey-1',
    title: 'Origins of Paris',
    description: 'A walk through the ages.',
    city: { id: 'city-1', name: 'Paris', country: 'France', latitude: 48.85, longitude: 2.35, google_place_id: null },
    city_id: 'city-1',
    status: 'published',
    created_by: 'user-1',
    created_at: new Date().toISOString(),
    stops: [
      {
        id: 'stop-1',
        sequence_order: 0,
        stop_latitude: null,
        stop_longitude: null,
        experience: {
          id: 'exp-1',
          city: { id: 'city-1', name: 'Paris', country: 'France', latitude: 48.85, longitude: 2.35, google_place_id: null },
          city_id: 'city-1',
          year: 1889,
          era_label: "World's Fair",
          status: 'approved',
          created_by: 'user-1',
          approved_by: null,
          google_maps_link: null,
          story_content: {
            id: 'story-1',
            narrative_script: 'You stand at the 1889 World\'s Fair...',
            description: 'The fair.',
            audio_narration_url: null,
            ai_model_used: 'claude-sonnet-4-6',
            estimated_duration_seconds: 300,
            created_at: new Date().toISOString(),
          },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      },
      {
        id: 'stop-2',
        sequence_order: 1,
        stop_latitude: null,
        stop_longitude: null,
        experience: {
          id: 'exp-2',
          city: { id: 'city-1', name: 'Paris', country: 'France', latitude: 48.85, longitude: 2.35, google_place_id: null },
          city_id: 'city-1',
          year: 2026,
          era_label: 'Present day',
          status: 'approved',
          created_by: 'user-1',
          approved_by: null,
          google_maps_link: null,
          story_content: {
            id: 'story-2',
            narrative_script: 'You stand in present-day Paris...',
            description: 'Today.',
            audio_narration_url: null,
            ai_model_used: 'claude-sonnet-4-6',
            estimated_duration_seconds: 300,
            created_at: new Date().toISOString(),
          },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      },
    ],
  };
}

function jsonResponse(body: unknown) {
  return new Response(JSON.stringify(body), { status: 200, headers: { 'Content-Type': 'application/json' } });
}

describe('JourneyViewer', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('shows the first stop by default with its narration', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => jsonResponse({ data: [] })));

    render(
      <Provider store={buildStore()}>
        <JourneyViewer journey={makeJourney()} />
      </Provider>
    );

    expect(screen.getByText('Origins of Paris')).toBeInTheDocument();
    expect(screen.getByText('Stop 1 of 2')).toBeInTheDocument();
    expect(screen.getByText(/1889 World's Fair/)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("You stand at the 1889 World's Fair...")).toBeInTheDocument();
    });
  });

  it('navigates to the next stop and loads its own narration', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => jsonResponse({ data: [] })));
    const user = userEvent.setup();

    render(
      <Provider store={buildStore()}>
        <JourneyViewer journey={makeJourney()} />
      </Provider>
    );

    await user.click(screen.getByRole('button', { name: 'Next stop →' }));

    await waitFor(() => {
      expect(screen.getByText('Stop 2 of 2')).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(screen.getByText('You stand in present-day Paris...')).toBeInTheDocument();
    });

    // Previous stop's content should no longer be shown.
    expect(screen.queryByText("You stand at the 1889 World's Fair...")).not.toBeInTheDocument();
  });

  it('disables Previous on the first stop and Next on the last stop', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => jsonResponse({ data: [] })));

    render(
      <Provider store={buildStore()}>
        <JourneyViewer journey={makeJourney()} />
      </Provider>
    );

    expect(screen.getByRole('button', { name: '← Previous stop' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Next stop →' })).toBeEnabled();
  });

  it('jumps directly to a stop via the dot indicators', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => jsonResponse({ data: [] })));
    const user = userEvent.setup();

    render(
      <Provider store={buildStore()}>
        <JourneyViewer journey={makeJourney()} />
      </Provider>
    );

    await user.click(screen.getByRole('tab', { name: 'Stop 2' }));

    await waitFor(() => {
      expect(screen.getByText('Stop 2 of 2')).toBeInTheDocument();
    });
  });

  it('shows a friendly message when the journey has no stops', () => {
    const empty = { ...makeJourney(), stops: [] };

    render(
      <Provider store={buildStore()}>
        <JourneyViewer journey={empty} />
      </Provider>
    );

    expect(screen.getByText('This journey has no stops yet.')).toBeInTheDocument();
  });
});
