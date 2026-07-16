import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NarrationPlayer } from '../../src/features/viewer/NarrationPlayer';

describe('NarrationPlayer', () => {
  it('shows the transcript directly when there is no audio', () => {
    render(
      <NarrationPlayer
        narrativeScript="You stand in the square..."
        durationSeconds={300}
        hasAudio={false}
        isPlaying={false}
        currentTime={0}
        onTogglePlay={vi.fn()}
      />
    );

    expect(screen.getByText('You stand in the square...')).toBeInTheDocument();
    expect(screen.getByText('No narration audio yet — read the story below.')).toBeInTheDocument();
  });

  it('reflects controlled isPlaying/currentTime props and calls onTogglePlay', async () => {
    const user = userEvent.setup();
    const onTogglePlay = vi.fn();

    const { rerender } = render(
      <NarrationPlayer
        narrativeScript="Script"
        durationSeconds={300}
        hasAudio
        isPlaying={false}
        currentTime={0}
        onTogglePlay={onTogglePlay}
      />
    );

    expect(screen.getByTestId('narration-time')).toHaveTextContent('0:00 / 5:00');
    await user.click(screen.getByRole('button', { name: 'Play narration' }));
    expect(onTogglePlay).toHaveBeenCalledTimes(1);

    rerender(
      <NarrationPlayer
        narrativeScript="Script"
        durationSeconds={300}
        hasAudio
        isPlaying
        currentTime={90}
        onTogglePlay={onTogglePlay}
      />
    );

    expect(screen.getByRole('button', { name: 'Pause narration' })).toBeInTheDocument();
    expect(screen.getByTestId('narration-time')).toHaveTextContent('1:30 / 5:00');
  });

  it('toggles the transcript independently of playback state', async () => {
    const user = userEvent.setup();

    render(
      <NarrationPlayer
        narrativeScript="You stand in the square..."
        durationSeconds={300}
        hasAudio
        isPlaying={false}
        currentTime={0}
        onTogglePlay={vi.fn()}
      />
    );

    expect(screen.queryByText('You stand in the square...')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Show transcript' }));
    expect(screen.getByText('You stand in the square...')).toBeInTheDocument();
  });
});
