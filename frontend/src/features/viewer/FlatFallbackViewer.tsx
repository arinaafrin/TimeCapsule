import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { PanoramaSphere, SpatialNarrationAudio } from './XRSphereScene';

interface FlatFallbackViewerProps {
  imageUrl: string;
  audioUrl: string | null;
  isPlaying: boolean;
  onTogglePlay: () => void;
}

export function FlatFallbackViewer({ imageUrl, audioUrl, isPlaying, onTogglePlay }: FlatFallbackViewerProps) {
  return (
    <div className="relative h-[480px] w-full overflow-hidden rounded-md bg-slate-900" data-testid="flat-fallback-viewer">
      <Canvas camera={{ position: [0, 0, 0.1], fov: 75 }}>
        <Suspense fallback={null}>
          <PanoramaSphere imageUrl={imageUrl} onSelect={onTogglePlay} />
          {audioUrl && <SpatialNarrationAudio audioUrl={audioUrl} isPlaying={isPlaying} />}
        </Suspense>
        <OrbitControls enableZoom={false} enablePan={false} rotateSpeed={-0.4} />
      </Canvas>

      <p className="absolute bottom-4 left-4 text-xs text-white/70">
        Drag to look around. VR headset not detected.
      </p>
    </div>
  );
}
