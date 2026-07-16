import { forwardRef, useEffect, useRef } from 'react';
import { PositionalAudio, useTexture } from '@react-three/drei';
import * as THREE from 'three';

interface PanoramaSphereProps {
  imageUrl: string;
  onSelect?: () => void;
}

export function PanoramaSphere({ imageUrl, onSelect }: PanoramaSphereProps) {
  const texture = useTexture(imageUrl);
  texture.colorSpace = THREE.SRGBColorSpace;

  // Performance pass (Milestone 7): mobile-chipset headsets (Quest standalone
  // GPUs) are the performance floor for this viewer, so tuning targets them:
  // - anisotropic filtering keeps the panorama sharp at grazing viewing
  //   angles without needing a higher base texture resolution
  // - mipmapping + LinearMipmapLinearFilter cuts overdraw/aliasing cost
  //   compared to a single full-res sample per pixel
  // - 48x32 sphere segments is a level-of-detail compromise: enough to look
  //   round from the camera's fixed position at the sphere's center, without
  //   the ~2x vertex cost of the previous 60x40 count
  texture.anisotropy = 4;
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;

  return (
    <mesh scale={[-1, 1, 1]} onClick={onSelect}>
      <sphereGeometry args={[500, 48, 32]} />
      <meshBasicMaterial map={texture} side={THREE.BackSide} />
    </mesh>
  );
}

interface SpatialNarrationAudioProps {
  audioUrl: string;
  isPlaying: boolean;
}

/**
 * Positional (spatial) audio for the narration track, using Three.js's
 * Web Audio-based PositionalAudio node attached to the camera listener.
 * Placed slightly in front of the origin so panning/attenuation as the
 * user looks around is audible in both VR and flat drag-to-look mode.
 */
export const SpatialNarrationAudio = forwardRef<THREE.PositionalAudio, SpatialNarrationAudioProps>(
  function SpatialNarrationAudio({ audioUrl, isPlaying }, forwardedRef) {
    const soundRef = useRef<THREE.PositionalAudio>(null);

    useEffect(() => {
      const sound = soundRef.current;
      if (!sound) return;

      if (isPlaying && !sound.isPlaying) {
        sound.play();
      } else if (!isPlaying && sound.isPlaying) {
        sound.pause();
      }
    }, [isPlaying]);

    return (
      <PositionalAudio
        ref={(node) => {
          soundRef.current = node;
          if (typeof forwardedRef === 'function') forwardedRef(node);
          else if (forwardedRef) forwardedRef.current = node;
        }}
        url={audioUrl}
        distance={2}
        loop={false}
        position={[0, 0, -1]}
      />
    );
  }
);
