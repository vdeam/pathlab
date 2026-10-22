import { Rng } from '../rng.js';

/** Fraction of cells turned into walls. Open enough to stay solvable in practice. */
const DENSITY = 0.28;

/**
 * Walls scattered uniformly at random.
 *
 * The most open kind of map, and the one where a heuristic pays off most: A\* heads
 * straight for the goal while Dijkstra spreads out in every direction.
 *
 * Cells are blocked independently, so a start or goal cell can end up walled in. Callers
 * that place endpoints are expected to clear them.
 */
export function randomObstacles(width: number, height: number, seed: number): Uint8Array {
  const rng = new Rng(seed);
  const walls = new Uint8Array(width * height);
  for (let i = 0; i < walls.length; i++) {
    if (rng.chance(DENSITY)) walls[i] = 1;
  }
  return walls;
}
