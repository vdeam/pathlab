import { GridGraph } from '../src/grid.js';
import { randomObstacles } from '../src/generators/random.js';

export interface Scenario {
  readonly grid: GridGraph;
  readonly start: number;
  readonly goal: number;
}

/**
 * A seeded random grid with the two opposite corners cleared, so the endpoints are always
 * walkable. The goal may still be unreachable, which is a case worth exercising.
 */
export function scenario(seed: number, diagonal = false): Scenario {
  const width = 24;
  const height = 18;
  const walls = randomObstacles(width, height, seed);
  walls[0] = 0;
  walls[walls.length - 1] = 0;
  const grid = new GridGraph(width, height, walls, { diagonal });
  return { grid, start: 0, goal: walls.length - 1 };
}

export const SEEDS = Array.from({ length: 50 }, (_, i) => i + 1);
