import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { GenerationProgress } from '../../src/features/experience/GenerationProgress';
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

function mockJobResponse(status: string) {
  return new Response(
    JSON.stringify({
      data: {
        id: 'job-1',
        experience_id: 'exp-1',
        status,
        job_type: 'story_text',
        error_message: status === 'failed' ? 'The AI provider timed out.' : null,
        started_at: null,
        completed_at: null,
      },
    }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
}

describe('GenerationProgress', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('shows the processing message while the job is in progress', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => mockJobResponse('processing')));

    render(
      <Provider store={buildStore()}>
        <GenerationProgress jobId="job-1" />
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('generation-progress')).toHaveTextContent(
        'Generating your TimeCapsule'
      );
    });
  });

  it('calls onComplete once the job status is completed', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => mockJobResponse('completed')));
    const onComplete = vi.fn();

    render(
      <Provider store={buildStore()}>
        <GenerationProgress jobId="job-1" onComplete={onComplete} />
      </Provider>
    );

    await waitFor(() => {
      expect(onComplete).toHaveBeenCalled();
    });

    expect(screen.getByTestId('generation-progress')).toHaveTextContent('ready');
  });

  it('shows the error message when the job fails', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => mockJobResponse('failed')));

    render(
      <Provider store={buildStore()}>
        <GenerationProgress jobId="job-1" />
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('generation-progress')).toHaveTextContent(
        'The AI provider timed out.'
      );
    });
  });
});
