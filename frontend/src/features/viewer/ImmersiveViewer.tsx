import { Suspense, useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { XR, XROrigin, createXRStore, useXRSessionModeSupported } from '@react-three/xr';
import { PanoramaSphere, SpatialNarrationAudio } from './XRSphereScene';
import { XRControllerHandler } from './XRControllerHandler';
import { FlatFallbackViewer } from './FlatFallbackViewer';
import { NarrationPlayer } from './NarrationPlayer';

interface ImmersiveViewerProps {
  imageUrl: string;
  audioUrl: string | null;
  narrativeScript: string;
  durationSeconds: number;
}

// Auto-injecting a dev XR emulator crashes outside a real browser with
// WebGL (including test environments, since it only checks for `window`).
// We don't want a synthetic controller auto-injecting in production either.
const xrStore = createXRStore({ emulate: false });

export function ImmersiveViewer({ imageUrl, audioUrl, narrativeScript, durationSeconds }: ImmersiveViewerProps) {
  const xrSupported = useXRSessionModeSupported('immersive-vr');

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const togglePlay = () => {
    if (!audioUrl) return;
    setIsPlaying((prev) => !prev);
  };

  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setCurrentTime((t) => {
          if (t + 0.25 >= durationSeconds) {
            setIsPlaying(false);
            return durationSeconds;
          }
          return t + 0.25;
        });
      }, 250);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, durationSeconds]);

  return (
    <div className="space-y-4">
      {xrSupported === false || xrSupported === undefined ? (
        <FlatFallbackViewer
          imageUrl={imageUrl}
          audioUrl={audioUrl}
          isPlaying={isPlaying}
          onTogglePlay={togglePlay}
        />
      ) : (
        <div className="relative h-[480px] w-full overflow-hidden rounded-md bg-slate-900" data-testid="xr-viewer">
          <Canvas camera={{ position: [0, 0, 0.1], fov: 75 }}>
            <XR store={xrStore}>
              <Suspense fallback={null}>
                <PanoramaSphere imageUrl={imageUrl} onSelect={togglePlay} />
                {audioUrl && <SpatialNarrationAudio audioUrl={audioUrl} isPlaying={isPlaying} />}
              </Suspense>
              <XROrigin />
              <XRControllerHandler onTrigger={togglePlay} />
            </XR>
          </Canvas>

          <button
            type="button"
            onClick={() => xrStore.enterVR()}
            className="absolute bottom-4 right-4 rounded-md bg-white/90 px-4 py-2 text-sm font-medium text-slate-900 hover:bg-white"
          >
            Enter VR
          </button>
        </div>
      )}

      <NarrationPlayer
        narrativeScript={narrativeScript}
        durationSeconds={durationSeconds}
        hasAudio={Boolean(audioUrl)}
        isPlaying={isPlaying}
        currentTime={currentTime}
        onTogglePlay={togglePlay}
      />
    </div>
  );
}
