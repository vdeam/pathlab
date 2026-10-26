import { describe, expect, it } from 'vitest';
import { aStar, dijkstra, greedyBestFirst } from '../src/algorithms/best-first.js';
import { GridGraph } from '../src/grid.js';
import { solve } from '../src/solve.js';
import { SEEDS, scenario } from './helpers.js';

/** Walks the path and adds up what the graph actually charges for each step. */
function walkCost(grid: GridGraph, path: readonly number[]): number {
  let total = 0;
  for (let i = 1; i < path.length; i++) {
    const edge = [...grid.neighbors(path[i - 1]!)].find((candidate) => candidate.to === path[i]);
    expect(edge, `step ${path[i - 1]} -> ${path[i]} is not a legal move`).toBeDefined();
    total += edge!.cost;
  }
  return total;
}

describe('dijkstra', () => {
  it('reports a path whose cost matches the moves it took', () => {
    for (const seed of SEEDS) {
      const { grid, start, goal } = scenario(seed);
      const result = solve(grid, start, goal, dijkstra);
      if (!result.found) continue;
      expect(result.path[0]).toBe(start);
      expect(result.path.at(-1)).toBe(goal);
      expect(walkCost(grid, result.path)).toBeCloseTo(result.cost, 9);
    }
  });

  it('expands every node at most once', () => {
    const { grid, start, goal } = scenario(3);
    const closed = solve(grid, start, goal, dijkstra)
      .events.filter((event) => event.type === 'close')
      .map((event) => event.node);
    expect(new Set(closed).size).toBe(closed.length);
  });
});

describe('a-star', () => {
  for (const diagonal of [false, true]) {
    it(`finds the same cost as dijkstra (diagonal=${diagonal})`, () => {
      for (const seed of SEEDS) {
        const { grid, start, goal } = scenario(seed, diagonal);
        const optimal = solve(grid, start, goal, dijkstra);
        const result = solve(grid, start, goal, aStar);
        expect(result.found).toBe(optimal.found);
        if (optimal.found) expect(result.cost).toBeCloseTo(optimal.cost, 9);
      }
    });
  }

  it('never expands more nodes than dijkstra', () => {
    for (const seed of SEEDS) {
      const { grid, start, goal } = scenario(seed);
      expect(solve(grid, start, goal, aStar).expanded).toBeLessThanOrEqual(solve(grid, start, goal, dijkstra).expanded);
    }
  });

  it('usually expands far fewer nodes than dijkstra', () => {
    const ratios = SEEDS.map((seed) => {
      const { grid, start, goal } = scenario(seed);
      return solve(grid, start, goal, aStar).expanded / solve(grid, start, goal, dijkstra).expanded;
    });
    const median = ratios.sort((a, b) => a - b)[Math.floor(ratios.length / 2)]!;
    expect(median).toBeLessThan(0.9);
  });

  describe('with a heuristic weight', () => {
    const WEIGHT = 3;

    it('stays within the weight factor of the optimal cost', () => {
      for (const seed of SEEDS) {
        const { grid, start, goal } = scenario(seed);
        const optimal = solve(grid, start, goal, dijkstra);
        if (!optimal.found) continue;
        const weighted = solve(grid, start, goal, aStar, { weight: WEIGHT });
        expect(weighted.cost).toBeLessThanOrEqual(optimal.cost * WEIGHT + 1e-9);
      }
    });

    it('expands fewer nodes than plain a-star on average', () => {
      const totals = SEEDS.reduce(
        (sum, seed) => {
          const { grid, start, goal } = scenario(seed);
          return {
            plain: sum.plain + solve(grid, start, goal, aStar).expanded,
            weighted: sum.weighted + solve(grid, start, goal, aStar, { weight: WEIGHT }).expanded,
          };
        },
        { plain: 0, weighted: 0 },
      );
      expect(totals.weighted).toBeLessThan(totals.plain);
    });
  });
});

describe('greedy best-first', () => {
  it('returns a legal path whenever one is found', () => {
    for (const seed of SEEDS) {
      const { grid, start, goal } = scenario(seed);
      const result = solve(grid, start, goal, greedyBestFirst);
      if (!result.found) continue;
      expect(walkCost(grid, result.path)).toBeCloseTo(result.cost, 9);
    }
  });

  it('agrees with dijkstra on whether the goal is reachable', () => {
    for (const seed of SEEDS) {
      const { grid, start, goal } = scenario(seed);
      expect(solve(grid, start, goal, greedyBestFirst).found).toBe(solve(grid, start, goal, dijkstra).found);
    }
  });

  it('sometimes returns a more expensive path than dijkstra', () => {
    const worse = SEEDS.filter((seed) => {
      const { grid, start, goal } = scenario(seed);
      const optimal = solve(grid, start, goal, dijkstra);
      const greedy = solve(grid, start, goal, greedyBestFirst);
      return optimal.found && greedy.cost > optimal.cost + 1e-9;
    });
    expect(worse.length).toBeGreaterThan(0);
  });

  it('never returns a cheaper path than dijkstra', () => {
    for (const seed of SEEDS) {
      const { grid, start, goal } = scenario(seed);
      const optimal = solve(grid, start, goal, dijkstra);
      if (!optimal.found) continue;
      expect(solve(grid, start, goal, greedyBestFirst).cost).toBeGreaterThanOrEqual(optimal.cost - 1e-9);
    }
  });
});

describe.each([
  ['dijkstra', dijkstra],
  ['a-star', aStar],
  ['greedy', greedyBestFirst],
] as const)('%s edge cases', (_name, run) => {
  const open = (width: number, height: number) => new GridGraph(width, height, new Uint8Array(width * height));

  it('handles a start that is also the goal', () => {
    const result = solve(open(3, 3), 4, 4, run);
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

  it('opens the start node before anything else', () => {
    const result = solve(open(4, 4), 0, 15, run);
    expect(result.events[0]).toEqual({ type: 'open', node: 0, parent: -1, g: 0, h: expect.any(Number) });
  });

  it('counts expanded and generated nodes consistently with its events', () => {
    const result = solve(open(6, 6), 0, 35, run);
    expect(result.expanded).toBe(result.events.filter((event) => event.type === 'close').length);
    expect(result.generated).toBe(result.events.filter((event) => event.type === 'open').length);
  });
});
