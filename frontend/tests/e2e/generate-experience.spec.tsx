import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import authReducer, { credentialsReceived } from '../../src/features/auth/authSlice';
import { apiClient } from '../../src/api/client';
import { ExperienceDetailPage } from '../../src/features/experience/ExperienceDetailPage';

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

const PARTNER = { id: 'user-1', name: 'Partner', email: 'partner@test.com', role: 'partner' as const };

function baseExperience(overrides: Record<string, unknown> = {}) {
  return {
    id: 'exp-1',
    city: { id: 'city-1', name: 'Paris', country: 'France', latitude: 48.85, longitude: 2.35, google_place_id: null },
    city_id: 'city-1',
    year: 1889,
    era_label: 'Belle Époque',
    status: 'draft',
    created_by: PARTNER.id,
    approved_by: null,
    google_maps_link: null,
    story_content: {},
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  };
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}

function buildStore() {
  const store = configureStore({
    reducer: {
      auth: authReducer,
      [apiClient.reducerPath]: apiClient.reducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(apiClient.middleware),
  });
  store.dispatch(credentialsReceived({ user: PARTNER, token: 'fake-token' }));
  return store;
}

function renderDetailPage(store: ReturnType<typeof buildStore>) {
  render(
    <Provider store={store}>
      <MemoryRouter initialEntries={['/experiences/exp-1']}>
        <Routes>
          <Route path="/experiences/:id" element={<ExperienceDetailPage />} />
        </Routes>
      </MemoryRouter>
    </Provider>
  );
}

describe('E2E: generate story -> generate media -> viewer playback', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it(
    'walks a partner from an empty experience through to a playable 360 viewer',
    async () => {
    const user = userEvent.setup();
    const store = buildStore();

    let experienceState = baseExperience();
    let mediaState: unknown[] = [];
    let storyJobPolls = 0;
    let mediaJobPolls = 0;

    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url =
        typeof input === 'string'
          ? input
          : input instanceof Request
            ? input.url
            : input.toString();

      if (url.endsWith('/experiences/exp-1') && !url.includes('generate')) {
        return jsonResponse({ data: experienceState });
      }
      if (url.endsWith('/experiences/exp-1/media')) {
        return jsonResponse({ data: mediaState });
      }
      if (url.endsWith('/experiences/exp-1/generate')) {
        return jsonResponse({ job_id: 'story-job-1', status: 'queued' }, 202);
      }
      if (url.endsWith('/ai-jobs/story-job-1')) {
        storyJobPolls += 1;
        const status = storyJobPolls < 2 ? 'processing' : 'completed';
        if (status === 'completed') {
          experienceState = baseExperience({
            story_content: {
              id: 'story-1',
              narrative_script: 'You stand in the Paris square in 1889...',
              description: 'A summary of Belle Époque Paris.',
              audio_narration_url: null,
              ai_model_used: 'claude-sonnet-4-6',
              estimated_duration_seconds: 300,
              created_at: new Date().toISOString(),
            },
          });
        }
        return jsonResponse({ data: { id: 'story-job-1', experience_id: 'exp-1', status, job_type: 'story_text', error_message: null, started_at: null, completed_at: null } });
      }
      if (url.endsWith('/experiences/exp-1/generate-media')) {
        return jsonResponse({ job_id: 'media-job-1', status: 'queued' }, 202);
      }
      if (url.endsWith('/ai-jobs/media-job-1')) {
        mediaJobPolls += 1;
        const status = mediaJobPolls < 2 ? 'processing' : 'completed';
        if (status === 'completed') {
          mediaState = [
            {
              id: 'media-1',
              experience_id: 'exp-1',
              type: 'panorama_360',
              source_type: 'ai_generated',
              attribution_text: null,
              url: 'https://example.com/panorama.jpg',
              created_at: new Date().toISOString(),
            },
          ];
        }
        return jsonResponse({ data: { id: 'media-job-1', experience_id: 'exp-1', status, job_type: 'image', error_message: null, started_at: null, completed_at: null } });
      }

      throw new Error(`Unhandled request in test: ${url}`);
    });
    vi.stubGlobal('fetch', fetchMock);

    renderDetailPage(store);

    // Step 1: initial load, no story yet.
    await waitFor(() => {
      expect(screen.getByText('No story has been generated for this TimeCapsule yet.')).toBeInTheDocument();
    });

    // Step 2: partner triggers story generation.
    await user.click(screen.getByRole('button', { name: 'Generate Story' }));
    await waitFor(() => {
      expect(screen.getByTestId('generation-progress')).toBeInTheDocument();
    });

    // Step 3: polling resolves to completed, story now shown.
    await waitFor(
      () => {
        expect(screen.getByTestId('narration-player')).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
    expect(screen.getByText('You stand in the Paris square in 1889...')).toBeInTheDocument();

    // Step 4: partner triggers media (360 image) generation.
    await user.click(screen.getByRole('button', { name: 'Generate 360° Image' }));

    // Step 5: polling resolves, panorama viewer renders.
    await waitFor(
      () => {
        expect(screen.getByTestId('flat-fallback-viewer')).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
    },
    20000
  );
});
