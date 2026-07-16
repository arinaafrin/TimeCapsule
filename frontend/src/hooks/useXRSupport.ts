import { useEffect, useState } from 'react';

/**
 * Detects whether the current browser/device supports an immersive-vr
 * WebXR session. Returns null while the check is in flight, then true/false.
 *
 * Resolves to false (never stays null forever) when:
 * - navigator.xr doesn't exist (non-WebXR browser)
 * - isSessionSupported rejects (e.g. insecure context, permission denied)
 * - isSessionSupported resolves false (no immersive-vr capable device)
 */
export function useXRSupport(): boolean | null {
  const [supported, setSupported] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;

    if (typeof navigator === 'undefined' || !navigator.xr) {
      setSupported(false);
      return;
    }

    navigator.xr
      .isSessionSupported('immersive-vr')
      .then((result) => {
        if (!cancelled) setSupported(result);
      })
      .catch(() => {
        if (!cancelled) setSupported(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return supported;
}
