# Milestone 7 — Manual VR Headset QA Checklist

Automated tests in this repo mock `@react-three/fiber`, `@react-three/drei`,
and `@react-three/xr` entirely (see `tests/unit/ImmersiveViewer.test.tsx`,
`XRControllerHandler.test.tsx`) — they verify *our* branching and event-wiring
logic, not real WebGL rendering, real stereo rendering, or real controller
input. jsdom has no GPU and no WebXR device, so none of that can be verified
by an automated test in this sandbox. **This checklist must be completed by
a human on real hardware before Milestone 7 is signed off.**

## Prerequisites
- A Meta Quest (or other WebXR-capable headset) with the Quest Browser (or
  equivalent) updated to a recent version
- The TimeCapsule frontend served over **HTTPS** (WebXR requires a secure
  context — `localhost` is exempt on the same machine, but a headset
  connecting over the network needs a real TLS cert or a tunnel like ngrok)
- An experience with an approved panorama_360 media asset and a generated
  story, reachable at `/experiences/:id`

## Checklist

### Flat/fallback mode (desktop or headset browser without entering VR)
- [ ] Panorama loads and fills the viewer without stretching/distortion
- [ ] Drag-to-look rotates the view smoothly in all directions (no jitter,
      no inverted axes)
- [ ] "Enter VR" button is visible and clickable
- [ ] Narration play/pause button and transcript toggle work correctly
- [ ] Progress bar advances in sync with the audio

### Entering VR
- [ ] Tapping "Enter VR" prompts the headset's permission dialog (first time)
- [ ] Session transitions into the headset without a black screen freeze
      lasting more than ~1 second
- [ ] Panorama renders correctly in stereo — no double vision, no
      obviously mismatched left/right eye offset
- [ ] Head tracking is smooth and low-latency (no visible judder when
      turning your head at a normal pace)

### Controller input
- [ ] A floating white ring is visible in the scene
- [ ] Pointing the controller ray at the ring and pulling the trigger
      toggles narration playback
- [ ] Pulling the trigger **without** aiming at the ring (pointed elsewhere
      in the scene) *also* toggles playback — this is the explicit
      `selectstart` binding, independent of the ray pointer
- [ ] This works from both the left and right controller

### Performance (Quest standalone GPU specifically)
- [ ] Frame rate feels stable — no stutter when turning your head quickly
- [ ] No visible texture aliasing/shimmer on the panorama at typical
      viewing distance
- [ ] Session runs for at least 5 minutes (the length of a narration) without
      a thermal/performance-triggered frame rate drop

### Exiting
- [ ] Removing the headset or using the system gesture to exit VR returns
      cleanly to flat mode without an error state
- [ ] Re-entering VR after exiting works without needing a page reload

## Known limitations (not blockers, but worth being aware of)
- **Texture compression**: the current build uses standard JPEG/PNG panorama
  textures with mipmapping + anisotropic filtering (GPU-side LOD tuning).
  True compressed-texture formats (KTX2/Basis) would need a server-side
  image-processing pipeline to generate them at upload/generation time —
  that's a separate, larger piece of work than a client-side rendering
  tweak, and isn't implemented yet.
- **Spatial audio**: narration audio is routed through Three.js
  `PositionalAudio` attached to the camera listener, which is the correct
  mechanism for WebXR-compatible audio — but it is not truly
  "3D-positioned" sound (it doesn't pan based on where in the scene the
  listener is facing relative to a sound source), since this is a single
  ambient narration track rather than a spatial sound effect tied to a
  specific point in the environment.
