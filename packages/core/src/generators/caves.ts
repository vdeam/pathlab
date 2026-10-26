import { Rng } from '../rng.js';

/** Fraction of cells blocked before smoothing. Below ~0.4 the result barely has walls. */
const INITIAL_FILL = 0.45;
/** Passes that also reseed walls into wide open space, followed by passes that only smooth. */
const SEEDING_PASSES = 4;
const SMOOTHING_PASSES = 3;

/**
 * Organic caverns, grown with a cellular automaton.
 *
 * Random noise is smoothed repeatedly until it clumps into caves and pockets. The result has
 * dead ends and concave walls, the shapes that trap a purely greedy search.
 */
export function caves(width: number, height: number, seed: number): Uint8Array {
  const rng = new Rng(seed);
  let walls: Uint8Array = new Uint8Array(width * height);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const onBorder = x === 0 || y === 0 || x === width - 1 || y === height - 1;
      walls[y * width + x] = onBorder || rng.chance(INITIAL_FILL) ? 1 : 0;
    }
  }

  for (let pass = 0; pass < SEEDING_PASSES; pass++) walls = smooth(walls, width, height, true);
  for (let pass = 0; pass < SMOOTHING_PASSES; pass++) walls = smooth(walls, width, height, false);
  keepLargestRegion(walls, width, height);
  return walls;
}

/**
 * Walls in the square window of the given radius around `(x, y)`, the cell itself included.
 * Anything outside the grid counts as wall, which keeps the border solid.
 *
 * Counting the center matters: it lets a wall survive on four wall neighbors instead of five,
 * and without it every pass erodes the map a little more until nothing is left.
 */
function countWalls(walls: Uint8Array, width: number, height: number, x: number, y: number, radius: number): number {
  let blocked = 0;
  for (let dy = -radius; dy <= radius; dy++) {
    for (let dx = -radius; dx <= radius; dx++) {
      const nx = x + dx;
      const ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= width || ny >= height || walls[ny * width + nx] === 1) blocked++;
    }
  }
  return blocked;
}

/**
 * One pass of the automaton.
 *
 * A cell becomes a wall when most of its immediate neighbors are walls, which is what makes
 * the noise clump together. On seeding passes a second rule also blocks cells that have
 * almost nothing around them for two cells in every direction: without it the walls erode
 * away pass after pass and the map ends up as one empty room.
 */
function smooth(walls: Uint8Array, width: number, height: number, reseed: boolean): Uint8Array {
  const next = new Uint8Array(walls.length);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const crowded = countWalls(walls, width, height, x, y, 1) >= 5;
      const empty = reseed && countWalls(walls, width, height, x, y, 2) <= 2;
      next[y * width + x] = crowded || empty ? 1 : 0;
    }
  }
  return next;
}

/**
 * Fills in every open region but the biggest one, so the map is always solvable.
 *
 * Smoothing happily produces isolated pockets, and a pocket the search can never reach is
 * not an interesting obstacle, just noise.
 */
function keepLargestRegion(walls: Uint8Array, width: number, height: number): void {
  const region = new Int32Array(walls.length).fill(-1);
  const queue = new Int32Array(walls.length);
  let largest = -1;
  let largestSize = 0;
  let current = 0;

  for (let origin = 0; origin < walls.length; origin++) {
    if (walls[origin] === 1 || region[origin] !== -1) continue;

    let head = 0;
    let tail = 0;
    let size = 0;
    region[origin] = current;
    queue[tail++] = origin;

    while (head < tail) {
      const cell = queue[head++]!;
      size++;
      const x = cell % width;
      const y = (cell - x) / width;
      for (const [dx, dy] of [
        [0, -1],
        [1, 0],
        [0, 1],
        [-1, 0],
      ] as const) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
        const neighbor = ny * width + nx;
        if (walls[neighbor] === 1 || region[neighbor] !== -1) continue;
        region[neighbor] = current;
        queue[tail++] = neighbor;
      }
    }

    if (size > largestSize) {
      largestSize = size;
      largest = current;
    }
    current++;
  }

  if (largest === -1) return;
  for (let i = 0; i < walls.length; i++) {
    if (walls[i] === 0 && region[i] !== largest) walls[i] = 1;
  }
}
