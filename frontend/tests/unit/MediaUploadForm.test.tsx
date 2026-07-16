import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MediaUploadForm } from '../../src/features/experience/MediaUploadForm';
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

describe('MediaUploadForm', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('submits the file and shows a success message', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        new Response(
          JSON.stringify({
            data: {
              id: 'media-1',
              experience_id: 'exp-1',
              type: 'panorama_360',
              source_type: 'partner_upload',
              attribution_text: null,
              url: 'https://example.com/media-1.jpg',
              created_at: new Date().toISOString(),
            },
          }),
          { status: 201, headers: { 'Content-Type': 'application/json' } }
        )
      )
    );

    const user = userEvent.setup();
    render(
      <Provider store={buildStore()}>
        <MediaUploadForm experienceId="exp-1" />
      </Provider>
    );

    const file = new File(['fake-image-content'], 'panorama.jpg', { type: 'image/jpeg' });
    const input = screen.getByLabelText('File') as HTMLInputElement;
    await user.upload(input, file);

    expect(input.files?.[0]).toBe(file);

    await user.click(screen.getByRole('button', { name: 'Upload' }));

    await waitFor(() => {
      expect(screen.getByText('Uploaded successfully.')).toBeInTheDocument();
    });
  });

  it('disables the submit button until a file is chosen', () => {
    render(
      <Provider store={buildStore()}>
        <MediaUploadForm experienceId="exp-1" />
      </Provider>
    );

    expect(screen.getByRole('button', { name: 'Upload' })).toBeDisabled();
  });
});
