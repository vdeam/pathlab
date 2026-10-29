import { eventsPerSecond, useStore } from '../store.js';
import { PauseIcon, PlayIcon, RewindIcon, StepBackIcon, StepForwardIcon } from './icons.js';

export interface PlaybackBarProps {
  /** Number of recorded steps in the current search. */
  readonly total: number;
}

export function PlaybackBar({ total }: PlaybackBarProps) {
  const cursor = useStore((state) => state.cursor);
  const playing = useStore((state) => state.playing);
  const speed = useStore((state) => state.speed);
  const setCursor = useStore((state) => state.setCursor);
  const setPlaying = useStore((state) => state.setPlaying);
  const setSpeed = useStore((state) => state.setSpeed);

  const atEnd = cursor >= total;

  const togglePlay = () => {
    if (playing) {
      setPlaying(false);
      return;
    }
    // Pressing play on a finished search replays it from the beginning.
    if (atEnd) setCursor(0);
    setPlaying(true);
  };

  const stepBy = (delta: number) => {
    setPlaying(false);
    setCursor(Math.max(0, Math.min(cursor + delta, total)));
  };

  return (
    <div className="playback" role="group" aria-label="Playback">
      <div className="playback__buttons">
        <button
          type="button"
          className="round"
          onClick={() => stepBy(-cursor)}
          aria-label="Rewind"
          disabled={cursor === 0}
        >
          <RewindIcon />
        </button>
        <button
          type="button"
          className="round"
          onClick={() => stepBy(-1)}
          aria-label="Step back"
          disabled={cursor === 0}
        >
          <StepBackIcon />
        </button>
        <button
          type="button"
          className="round round--primary"
          onClick={togglePlay}
          aria-label={playing ? 'Pause' : 'Play'}
        >
          {playing ? <PauseIcon /> : <PlayIcon />}
        </button>
        <button type="button" className="round" onClick={() => stepBy(1)} aria-label="Step forward" disabled={atEnd}>
          <StepForwardIcon />
        </button>
      </div>

      <label className="playback__scrub">
        <span className="visually-hidden">Timeline</span>
        <input
          type="range"
          min={0}
          max={Math.max(total, 1)}
          value={cursor}
          onChange={(event) => {
            setPlaying(false);
            setCursor(Number(event.target.value));
          }}
        />
      </label>

      <span className="meta playback__count">
        {cursor} / {total}
      </span>

      <label className="playback__speed">
        <span className="visually-hidden">Speed</span>
        <input type="range" min={0} max={60} value={speed} onChange={(event) => setSpeed(Number(event.target.value))} />
        <span className="meta">{Math.round(eventsPerSecond(speed))}/s</span>
      </label>
    </div>
  );
}
