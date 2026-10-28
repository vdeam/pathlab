import { getGenerator } from '@pathlab/core';
import { useMemo } from 'react';
import { GridCanvas } from './components/GridCanvas.js';
import { nearestOpenCell } from './lib/placement.js';

/** Odd dimensions, so maze corridors land on the lattice without a clipped last row. */
const GRID_WIDTH = 49;
const GRID_HEIGHT = 29;
const SEED = 2024;

export function App() {
  const scenario = useMemo(() => {
    const walls = getGenerator('rooms').generate(GRID_WIDTH, GRID_HEIGHT, SEED);
    return {
      walls,
      start: nearestOpenCell(walls, GRID_WIDTH, 2, Math.floor(GRID_HEIGHT / 2)),
      goal: nearestOpenCell(walls, GRID_WIDTH, GRID_WIDTH - 3, Math.floor(GRID_HEIGHT / 2)),
    };
  }, []);

  return (
    <>
      <header className="header">
        <div className="header__inner">
          <span className="brand">
            <span className="brand__mark" aria-hidden="true" />
            Pathlab
          </span>
          <span className="meta">
            {GRID_WIDTH} × {GRID_HEIGHT} · seed {SEED}
          </span>
        </div>
      </header>

      <main className="page">
        <section className="hero">
          <div>
            <h1>Find the way.</h1>
            <p>Draw a map, pick an algorithm, and watch exactly how it searches.</p>
          </div>
        </section>

        <div className="workspace">
          <aside className="panel" />
          <section className="stage">
            <div className="card card--stage">
              <GridCanvas
                width={GRID_WIDTH}
                height={GRID_HEIGHT}
                walls={scenario.walls}
                start={scenario.start}
                goal={scenario.goal}
              />
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
