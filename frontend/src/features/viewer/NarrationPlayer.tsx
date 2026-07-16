import { useState } from 'react';

interface NarrationPlayerProps {
  narrativeScript: string;
  durationSeconds: number;
  hasAudio: boolean;
  isPlaying: boolean;
  currentTime: number;
  onTogglePlay: () => void;
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Note: this component no longer owns an <audio> element. Actual playback
// happens inside the Three.js/WebXR audio graph (see SpatialNarrationAudio
// in XRSphereScene.tsx), driven by the shared isPlaying/currentTime state
// that ImmersiveViewer owns — that's the single source of truth so flat
// mode and VR mode stay in sync with this transcript/scrubber UI.
export function NarrationPlayer({
  narrativeScript,
  durationSeconds,
  hasAudio,
  isPlaying,
  currentTime,
  onTogglePlay,
}: NarrationPlayerProps) {
  const [showTranscript, setShowTranscript] = useState(false);

  if (!hasAudio) {
    return (
      <div data-testid="narration-player" className="rounded-md border border-slate-200 p-4">
        <p className="text-sm text-slate-500">No narration audio yet — read the story below.</p>
        <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-slate-700">{narrativeScript}</p>
      </div>
    );
  }

  return (
    <div data-testid="narration-player" className="rounded-md border border-slate-200 p-4">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onTogglePlay}
          aria-label={isPlaying ? 'Pause narration' : 'Play narration'}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-white hover:bg-slate-700"
        >
          {isPlaying ? '❚❚' : '▶'}
        </button>

        <div className="flex-1">
          <div className="h-1.5 w-full rounded-full bg-slate-200">
            <div
              className="h-1.5 rounded-full bg-slate-900"
              style={{ width: `${Math.min(100, (currentTime / durationSeconds) * 100)}%` }}
            />
          </div>
        </div>

        <span className="text-xs text-slate-500" data-testid="narration-time">
          {formatTime(currentTime)} / {formatTime(durationSeconds)}
        </span>
      </div>

      <button
        type="button"
        onClick={() => setShowTranscript((v) => !v)}
        className="mt-3 text-xs font-medium text-slate-500 underline"
      >
        {showTranscript ? 'Hide transcript' : 'Show transcript'}
      </button>

      {showTranscript && (
        <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-slate-700">{narrativeScript}</p>
      )}
    </div>
  );
}
