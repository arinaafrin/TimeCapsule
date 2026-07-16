import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

let xrSessionSupported: boolean | undefined = false;

vi.mock('@react-three/fiber', () => ({
  Canvas: ({ children }: { children: React.ReactNode }) => <div data-testid="mock-canvas">{children}</div>, // eslint-disable-line
}));
vi.mock('@react-three/drei', () => ({
  OrbitControls: () => 'OrbitControls',
  useTexture: () => ({ colorSpace: '' }), // eslint-disable-line
  PositionalAudio: () => 'PositionalAudio',
}));
vi.mock('@react-three/xr', () => ({
  XR: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  XROrigin: () => null,
  createXRStore: () => ({ enterVR: vi.fn() }),
  useXRSessionModeSupported: () => xrSessionSupported,
  useXRInputSourceState: () => undefined,
  useXRInputSourceEvent: () => {},
}));

import { ImmersiveViewer } from '../../src/features/viewer/ImmersiveViewer';

describe('ImmersiveViewer', () => {
  afterEach(() => {
    xrSessionSupported = false;
  });

  it('renders the flat fallback viewer when no VR headset is supported', async () => {
    xrSessionSupported = false;

    render(
      <ImmersiveViewer
        imageUrl="https://example.com/pano.jpg"
        audioUrl="https://example.com/narration.mp3"
        narrativeScript="You stand in the square..."
        durationSeconds={300}
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId('flat-fallback-viewer')).toBeInTheDocument();
    });
    expect(screen.queryByTestId('xr-viewer')).not.toBeInTheDocument();
  });

  it('renders the XR viewer with an Enter VR button when a headset is supported', async () => {
    xrSessionSupported = true;

    render(
      <ImmersiveViewer
        imageUrl="https://example.com/pano.jpg"
        audioUrl="https://example.com/narration.mp3"
        narrativeScript="You stand in the square..."
        durationSeconds={300}
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId('xr-viewer')).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: 'Enter VR' })).toBeInTheDocument();
  });

  it('toggling play from the narration player updates the play/pause label', async () => {
    xrSessionSupported = false;
    const user = userEvent.setup();

    render(
      <ImmersiveViewer
        imageUrl="https://example.com/pano.jpg"
        audioUrl="https://example.com/narration.mp3"
        narrativeScript="You stand in the square..."
        durationSeconds={300}
      />
    );

    const playButton = await screen.findByRole('button', { name: 'Play narration' });
    await user.click(playButton);

    expect(await screen.findByRole('button', { name: 'Pause narration' })).toBeInTheDocument();
  });

  it('shows a transcript-only narration player when there is no audio url', async () => {
    xrSessionSupported = false;

    render(
      <ImmersiveViewer
        imageUrl="https://example.com/pano.jpg"
        audioUrl={null}
        narrativeScript="You stand in the square..."
        durationSeconds={300}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('No narration audio yet — read the story below.')).toBeInTheDocument();
    });
  });
});
