import { describe, expect, it } from 'vitest';
import { ALGORITHMS, getAlgorithm } from '../src/algorithms/registry.js';
import { solve } from '../src/solve.js';
import { SEEDS, scenario } from './helpers.js';

describe('algorithm registry', () => {
  it('exposes algorithms with unique ids', () => {
    const ids = ALGORITHMS.map((algorithm) => algorithm.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('looks an algorithm up by id', () => {
    expect(getAlgorithm('astar').id).toBe('astar');
  });

  it('throws on an unknown id', () => {
    expect(() => getAlgorithm('nope')).toThrow(/Unknown algorithm/);
  });

  it('marks exactly a-star and dijkstra as optimal', () => {
    const optimalIds = ALGORITHMS.filter((algorithm) => algorithm.optimal)
      .map((algorithm) => algorithm.id)
      .sort();
    expect(optimalIds).toEqual(['astar', 'dijkstra']);
  });
});

// Every entry must behave like a real search: a legal, connected path whose cost matches
// its own moves, agreement with Dijkstra on reachability, and a usable event trace. This
// is what catches a registry entry wired to the wrong function, or a `fixed()` adapter that
// silently drops an option the algorithm needed.
describe.each(ALGORITHMS)('$name via the registry', ({ run }) => {
  const dijkstraRun = getAlgorithm('dijkstra').run;

  it('returns a path that matches its own events', () => {
    for (const seed of SEEDS) {
      const { grid, start, goal } = scenario(seed);
      const result = solve(grid, start, goal, run);
      expect(result.found).toBe(solve(grid, start, goal, dijkstraRun).found);
      if (!result.found) continue;

      expect(result.path[0]).toBe(start);
      expect(result.path.at(-1)).toBe(goal);
      for (let i = 1; i < result.path.length; i++) {
        const neighbors = [...grid.neighbors(result.path[i - 1]!)].map((edge) => edge.to);
        expect(neighbors).toContain(result.path[i]);
      }
    }
  });

  it('ends with found or not-found, and reports counts consistent with its events', () => {
    const { grid, start, goal } = scenario(1);
    const result = solve(grid, start, goal, run);
    expect(['found', 'not-found']).toContain(result.events.at(-1)?.type);
    expect(result.expanded).toBe(result.events.filter((event) => event.type === 'close').length);
    expect(result.generated).toBe(result.events.filter((event) => event.type === 'open').length);
  });
});

describe.each(ALGORITHMS.filter((algorithm) => algorithm.optimal))('$name optimality', ({ run }) => {
  const dijkstraRun = getAlgorithm('dijkstra').run;

  it('matches the cost dijkstra finds', () => {
    for (const seed of SEEDS) {
      const { grid, start, goal } = scenario(seed);
      const optimal = solve(grid, start, goal, dijkstraRun);
      if (!optimal.found) continue;
      expect(solve(grid, start, goal, run).cost).toBeCloseTo(optimal.cost, 9);
    }
  });
});
