import { ALGORITHMS } from '@pathlab/core';
import { useStore } from '../store.js';

export function AlgorithmPanel() {
  const algorithmId = useStore((state) => state.algorithmId);
  const setAlgorithm = useStore((state) => state.setAlgorithm);
  const diagonal = useStore((state) => state.diagonal);
  const setDiagonal = useStore((state) => state.setDiagonal);

  return (
    <section className="card">
      <header className="card__head">
        <span>Algorithm</span>
      </header>

      <div className="card__body">
        <div className="options" role="radiogroup" aria-label="Algorithm">
          {ALGORITHMS.map((algorithm) => {
            const selected = algorithm.id === algorithmId;
            return (
              <button
                key={algorithm.id}
                type="button"
                role="radio"
                aria-checked={selected}
                className="option"
                onClick={() => setAlgorithm(algorithm.id)}
              >
                <span className="option__name">{algorithm.name}</span>
                {selected && <span className="option__note">{algorithm.summary}</span>}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          role="switch"
          aria-checked={diagonal}
          className="switch"
          onClick={() => setDiagonal(!diagonal)}
        >
          <span className="switch__text">
            <span className="switch__label">Diagonal moves</span>
            <span className="switch__note">Eight directions, never cutting corners</span>
          </span>
          <span className="switch__track" aria-hidden="true">
            <span className="switch__thumb" />
          </span>
        </button>
      </div>
    </section>
  );
}
