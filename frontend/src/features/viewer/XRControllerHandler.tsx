import { useXRInputSourceState, useXRInputSourceEvent } from '@react-three/xr';

interface XRControllerHandlerProps {
  onTrigger: () => void;
}

/**
 * Wires up VR controller input for the immersive viewer:
 *  - "look + point": a small floating ring the user can aim the
 *    controller ray at and pull the trigger on (or click, in flat mode) —
 *    handled via the mesh's own onClick, which @react-three/xr's default
 *    ray pointer routes controller "select" events into automatically.
 *  - "trigger-based interaction": an explicit raw listener on the
 *    controller's select event (independent of where it's pointing),
 *    so a trigger pull toggles narration playback even if the user
 *    isn't precisely aiming at the ring.
 */
export function XRControllerHandler({ onTrigger }: XRControllerHandlerProps) {
  const leftController = useXRInputSourceState('controller', 'left');
  const rightController = useXRInputSourceState('controller', 'right');

  useXRInputSourceEvent(leftController?.inputSource, 'selectstart', onTrigger, [onTrigger]);
  useXRInputSourceEvent(rightController?.inputSource, 'selectstart', onTrigger, [onTrigger]);

  return (
    <mesh position={[0, -1, -2]} onClick={onTrigger} data-testid="xr-toggle-ring">
      <torusGeometry args={[0.15, 0.03, 16, 32]} />
      <meshBasicMaterial color="white" />
    </mesh>
  );
}
