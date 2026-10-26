import { describe, expect, it } from 'vitest';
import { dijkstra } from '../src/algorithms/best-first.js';
import { bfs } from '../src/algorithms/bfs.js';
import { dfs } from '../src/algorithms/dfs.js';
import { GridGraph } from '../src/grid.js';
import { solve } from '../src/solve.js';
import { SEEDS, scenario } from './helpers.js';

/** Checks that consecutive nodes really are neighbors, and returns what the moves cost. */
function walkCost(grid: GridGraph, path: readonly number[]): number {
  let total = 0;
  for (let i = 1; i < path.length; i++) {
    const edge = [...grid.neighbors(path[i - 1]!)].find((candidate) => candidate.to === path[i]);
    expect(edge, `step ${path[i - 1]} -> ${path[i]} is not a legal move`).toBeDefined();
    total += edge!.cost;
  }
  return total;
}

describe('breadth-first search', () => {
  it('finds the cheapest path when every step costs the same', () => {
    for (const seed of SEEDS) {
      const { grid, start, goal } = scenario(seed);
      const optimal = solve(grid, start, goal, dijkstra);
      const result = solve(grid, start, goal, bfs);
      expect(result.found).toBe(optimal.found);
      if (optimal.found) expect(result.cost).toBeCloseTo(optimal.cost, 9);
    }
  });

  it('always takes the fewest steps, which is the guarantee it actually offers', () => {
    for (const diagonal of [false, true]) {
      for (const seed of SEEDS) {
        const { grid, start, goal } = scenario(seed, diagonal);
        const optimal = solve(grid, start, goal, dijkstra);
        if (!optimal.found) continue;
        expect(solve(grid, start, goal, bfs).path.length).toBeLessThanOrEqual(optimal.path.length);
      }
    }
  });

  it('stops being cost-optimal once a diagonal costs more than a straight step', () => {
    // On an open grid the two notions agree, because every fewest-steps route uses the same
    // number of diagonals. Walls are what pull them apart.
    const costlier = SEEDS.filter((seed) => {
      const { grid, start, goal } = scenario(seed, true);
      const optimal = solve(grid, start, goal, dijkstra);
      return optimal.found && solve(grid, start, goal, bfs).cost > optimal.cost + 1e-9;
    });
    expect(costlier.length).toBeGreaterThan(0);
  });

  it('expands nodes in non-decreasing order of depth', () => {
    const { grid, start, goal } = scenario(5);
    let previous = -1;
    for (const event of solve(grid, start, goal, bfs).events) {
      if (event.type !== 'close') continue;
      expect(event.g).toBeGreaterThanOrEqual(previous);
      previous = event.g;
    }
  });

  it('expands every node at most once', () => {
    const { grid, start, goal } = scenario(9);
    const closed = solve(grid, start, goal, bfs)
      .events.filter((event) => event.type === 'close')
      .map((event) => event.node);
    expect(new Set(closed).size).toBe(closed.length);
  });
});

describe('depth-first search', () => {
  it('returns a legal path with a cost that matches its moves', () => {
    for (const seed of SEEDS) {
      const { grid, start, goal } = scenario(seed);
      const result = solve(grid, start, goal, dfs);
      if (!result.found) continue;
      expect(result.path[0]).toBe(start);
      expect(result.path.at(-1)).toBe(goal);
      expect(walkCost(grid, result.path)).toBeCloseTo(result.cost, 9);
    }
  });

  it('expands every node at most once', () => {
    const { grid, start, goal } = scenario(11);
    const closed = solve(grid, start, goal, dfs)
      .events.filter((event) => event.type === 'close')
      .map((event) => event.node);
    expect(new Set(closed).size).toBe(closed.length);
  });

  it('never matches the cheapest path, and typically costs about twice as much', () => {
    const ratios = SEEDS.flatMap((seed) => {
      const { grid, start, goal } = scenario(seed);
      const optimal = solve(grid, start, goal, dijkstra);
      if (!optimal.found) return [];
      return [solve(grid, start, goal, dfs).cost / optimal.cost];
    });

    expect(ratios.length).toBeGreaterThan(10);
    expect(ratios.every((ratio) => ratio > 1)).toBe(true);
    const median = ratios.sort((a, b) => a - b)[Math.floor(ratios.length / 2)]!;
    expect(median).toBeGreaterThan(1.5);
  });
});

describe.each([
  ['breadth-first', bfs],
  ['depth-first', dfs],
] as const)('%s search', (_name, run) => {
  it('agrees with dijkstra on whether the goal is reachable', () => {
    for (const seed of SEEDS) {
      const { grid, start, goal } = scenario(seed);
      expect(solve(grid, start, goal, run).found).toBe(solve(grid, start, goal, dijkstra).found);
    }
  });

  it('never returns a cheaper path than dijkstra', () => {
    for (const seed of SEEDS) {
      const { grid, start, goal } = scenario(seed);
      const optimal = solve(grid, start, goal, dijkstra);
      if (!optimal.found) continue;
      expect(solve(grid, start, goal, run).cost).toBeGreaterThanOrEqual(optimal.cost - 1e-9);
    }
  });

  it('handles a start that is also the goal', () => {
    const grid = new GridGraph(3, 3, new Uint8Array(9));
    const result = solve(grid, 4, 4, run);
    expect(result.found).toBe(true);
    expect(result.path).toEqual([4]);
    expect(result.cost).toBe(0);
  });

  it('reports not-found when a wall separates start from goal', () => {
    const walls = new Uint8Array(25);
    for (let y = 0; y < 5; y++) walls[y * 5 + 2] = 1;
    const result = solve(new GridGraph(5, 5, walls), 0, 24, run);
    expect(result.found).toBe(false);
    expect(result.cost).toBe(Infinity);
    expect(result.events.at(-1)?.type).toBe('not-found');
  });
});
