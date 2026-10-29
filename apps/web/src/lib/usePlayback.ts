import { useEffect } from 'react';
import { eventsPerSecond, useStore } from '../store.js';

/**
 * Advances the cursor while playback is on.
 *
 * The step count comes from elapsed time rather than from a fixed amount per frame, so the
 * speed means the same thing whether the display runs at 60Hz or 144Hz, and a dropped frame
 * is caught up on the next one instead of slowing the whole run down.
 */
export function usePlayback(total: number): void {
  const playing = useStore((state) => state.playing);
  const speed = useStore((state) => state.speed);

  useEffect(() => {
    if (!playing) return;

    let frame = 0;
    let last = performance.now();
    // Fractional steps carried between frames, so slow speeds still advance evenly.
    let carry = 0;

    const tick = (now: number) => {
      const { cursor, setCursor, setPlaying } = useStore.getState();
      carry += ((now - last) / 1000) * eventsPerSecond(speed);
      last = now;

      const whole = Math.floor(carry);
      if (whole > 0) {
        carry -= whole;
        const next = Math.min((cursor ?? total) + whole, total);
        setCursor(next);
        if (next >= total) {
          setPlaying(false);
          return;
        }
      }
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [playing, speed, total]);
}
