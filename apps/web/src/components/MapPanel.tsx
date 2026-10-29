import { MAP_GENERATORS } from '@pathlab/core';
import { useStore } from '../store.js';

export function MapPanel() {
  const generatorId = useStore((state) => state.generatorId);
  const seed = useStore((state) => state.seed);
  const setGenerator = useStore((state) => state.setGenerator);
  const shuffleSeed = useStore((state) => state.shuffleSeed);
  const clearWalls = useStore((state) => state.clearWalls);

  return (
    <section className="card">
      <header className="card__head">
        <span>Map</span>
        <span>seed {seed}</span>
      </header>

      <div className="card__body">
        <div className="options" role="radiogroup" aria-label="Map generator">
          {MAP_GENERATORS.map((generator) => {
            const selected = generator.id === generatorId;
            return (
              <button
                key={generator.id}
                type="button"
                role="radio"
                aria-checked={selected}
                className="option"
                onClick={() => setGenerator(generator.id)}
              >
                <span className="option__name">{generator.name}</span>
                {selected && <span className="option__note">{generator.summary}</span>}
              </button>
            );
          })}
        </div>

        <div className="buttons">
          <button type="button" className="button button--primary" onClick={shuffleSeed}>
            New seed
          </button>
          <button type="button" className="button" onClick={clearWalls}>
            Clear
          </button>
        </div>
      </div>
    </section>
  );
}
