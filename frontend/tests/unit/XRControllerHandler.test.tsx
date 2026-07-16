import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent, screen } from '@testing-library/react';

let capturedHandlers: Record<string, (event: unknown) => void> = {};
let leftInputSource: { inputSource: string } | undefined = { inputSource: 'left-controller' };
let rightInputSource: { inputSource: string } | undefined = { inputSource: 'right-controller' };

vi.mock('@react-three/xr', () => ({
  useXRInputSourceState: (_type: string, handedness: 'left' | 'right') =>
    handedness === 'left' ? leftInputSource : rightInputSource,
  useXRInputSourceEvent: ( // eslint-disable-line
    inputSource: string | undefined,
    event: string,
    fn: (e: unknown) => void
  ) => {
    if (inputSource) {
      capturedHandlers[`${inputSource}:${event}`] = fn;
    }
  },
}));

import { XRControllerHandler } from '../../src/features/viewer/XRControllerHandler';

describe('XRControllerHandler', () => {
  it('renders a clickable ring that calls onTrigger', () => {
    const onTrigger = vi.fn();
    render(<XRControllerHandler onTrigger={onTrigger} />);

    fireEvent.click(screen.getByTestId('xr-toggle-ring'));
    expect(onTrigger).toHaveBeenCalledTimes(1);
  });

  it('wires selectstart events for both left and right controllers', () => {
    capturedHandlers = {};
    const onTrigger = vi.fn();
    render(<XRControllerHandler onTrigger={onTrigger} />);

    expect(capturedHandlers['left-controller:selectstart']).toBeDefined();
    expect(capturedHandlers['right-controller:selectstart']).toBeDefined();

    capturedHandlers['left-controller:selectstart']({});
    capturedHandlers['right-controller:selectstart']({});
    expect(onTrigger).toHaveBeenCalledTimes(2);
  });

  it('does not throw when a controller is not connected', () => {
    leftInputSource = undefined;
    capturedHandlers = {};
    const onTrigger = vi.fn();

    expect(() => render(<XRControllerHandler onTrigger={onTrigger} />)).not.toThrow();
    expect(capturedHandlers['left-controller:selectstart']).toBeUndefined();

    leftInputSource = { inputSource: 'left-controller' };
  });
});
