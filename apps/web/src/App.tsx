import { GridCanvas } from './components/GridCanvas.js';
import { MapPanel } from './components/MapPanel.js';
import { GRID_HEIGHT, GRID_WIDTH, useStore } from './store.js';

export function App() {
  const walls = useStore((state) => state.walls);
  const start = useStore((state) => state.start);
  const goal = useStore((state) => state.goal);
  const seed = useStore((state) => state.seed);
  const setWall = useStore((state) => state.setWall);
  const moveStart = useStore((state) => state.moveStart);
  const moveGoal = useStore((state) => state.moveGoal);

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
        </section>

        <div className="workspace">
          <aside className="panel">
            <MapPanel />
          </aside>
          <section className="stage">
            <div className="card card--stage">
              <GridCanvas
                width={GRID_WIDTH}
                height={GRID_HEIGHT}
                walls={walls}
                start={start}
                goal={goal}
                onSetWall={setWall}
                onMoveStart={moveStart}
                onMoveGoal={moveGoal}
              />
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
