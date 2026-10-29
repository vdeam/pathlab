import { getAlgorithm, GridGraph, solve } from '@pathlab/core';
import { useMemo } from 'react';
import { AlgorithmPanel } from './components/AlgorithmPanel.js';
import { GridCanvas } from './components/GridCanvas.js';
import { MapPanel } from './components/MapPanel.js';
import { PlaybackBar } from './components/PlaybackBar.js';
import { Stats } from './components/Stats.js';
import { usePlayback } from './lib/usePlayback.js';
import { viewAt } from './lib/view.js';
import { GRID_HEIGHT, GRID_WIDTH, useStore } from './store.js';

const NODE_COUNT = GRID_WIDTH * GRID_HEIGHT;

export function App() {
  const walls = useStore((state) => state.walls);
  const start = useStore((state) => state.start);
  const goal = useStore((state) => state.goal);
  const seed = useStore((state) => state.seed);
  const algorithmId = useStore((state) => state.algorithmId);
  const diagonal = useStore((state) => state.diagonal);
  const cursor = useStore((state) => state.cursor);
  const setWall = useStore((state) => state.setWall);
  const moveStart = useStore((state) => state.moveStart);
  const moveGoal = useStore((state) => state.moveGoal);

  // The search is a pure function of the scenario, so it is derived rather than stored.
  // Nothing can go stale: edit the map and the result is recomputed on the next render.
  const result = useMemo(() => {
    const grid = new GridGraph(GRID_WIDTH, GRID_HEIGHT, walls, { diagonal });
    return solve(grid, start, goal, getAlgorithm(algorithmId).run);
  }, [walls, start, goal, algorithmId, diagonal]);

  const total = result.events.length;
  const view = useMemo(() => viewAt(result, cursor ?? total, NODE_COUNT), [result, cursor, total]);
  const algorithm = getAlgorithm(algorithmId);

  usePlayback(total);

  return (
    <>
      <header className="header">
        <div className="header__inner">
          <span className="brand">
            <span className="brand__mark" aria-hidden="true" />
            Pathlab
          </span>
          <span className="meta">
            {GRID_WIDTH} × {GRID_HEIGHT} · seed {seed}
          </span>
        </div>
      </header>

      <main className="page">
        <section className="hero">
          <div>
            <h1>Find the way.</h1>
            <p>Draw a map, pick an algorithm, and watch exactly how it searches.</p>
          </div>
          <span className="meta">
            {algorithm.name} · {view.expanded} expanded
            {view.exhausted ? ' · no route' : ''}
          </span>
        </section>

        <div className="workspace">
          <aside className="panel">
            <AlgorithmPanel />
            <MapPanel />
          </aside>
          <section className="stage">
            <Stats view={view} />
            <div className="card card--stage">
              <GridCanvas
                width={GRID_WIDTH}
                height={GRID_HEIGHT}
                walls={walls}
                start={start}
                goal={goal}
                state={view.state}
                path={view.path}
                onSetWall={setWall}
                onMoveStart={moveStart}
                onMoveGoal={moveGoal}
              />
            </div>
            <PlaybackBar total={total} />
            <div className="legend">
              <span>
                <i style={{ background: 'var(--blue)' }} />
                Frontier
              </span>
              <span>
                <i style={{ background: 'var(--visited)' }} />
                Explored
              </span>
              <span>
                <i style={{ background: 'var(--accent)' }} />
                Path
              </span>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
