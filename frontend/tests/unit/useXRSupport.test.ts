import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useXRSupport } from '../../src/hooks/useXRSupport';

describe('useXRSupport', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns null while the check is in flight', () => {
    vi.stubGlobal('navigator', {
      ...navigator,
      xr: { isSessionSupported: vi.fn(() => new Promise(() => {})) },
    });

    const { result } = renderHook(() => useXRSupport());

    expect(result.current).toBeNull();
  });

  it('resolves true when immersive-vr is supported', async () => {
    vi.stubGlobal('navigator', {
      ...navigator,
      xr: { isSessionSupported: vi.fn().mockResolvedValue(true) },
    });

    const { result } = renderHook(() => useXRSupport());

    await waitFor(() => {
      expect(result.current).toBe(true);
    });
  });

  it('resolves false when navigator.xr does not support immersive-vr', async () => {
    vi.stubGlobal('navigator', {
      ...navigator,
      xr: { isSessionSupported: vi.fn().mockResolvedValue(false) },
    });

    const { result } = renderHook(() => useXRSupport());

    await waitFor(() => {
      expect(result.current).toBe(false);
    });
  });

  it('resolves false (not stuck loading) when navigator.xr does not exist at all', async () => {
    vi.stubGlobal('navigator', { ...navigator, xr: undefined });

    const { result } = renderHook(() => useXRSupport());

    await waitFor(() => {
      expect(result.current).toBe(false);
    });
  });

  it('resolves false when isSessionSupported rejects (e.g. insecure context)', async () => {
    vi.stubGlobal('navigator', {
      ...navigator,
      xr: { isSessionSupported: vi.fn().mockRejectedValue(new Error('not supported')) },
    });

    const { result } = renderHook(() => useXRSupport());

    await waitFor(() => {
      expect(result.current).toBe(false);
    });
  });
});
