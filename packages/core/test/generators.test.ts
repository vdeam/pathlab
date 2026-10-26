import { describe, expect, it } from 'vitest';
import { getGenerator, MAP_GENERATORS } from '../src/generators/registry.js';

const WIDTH = 40;
const HEIGHT = 25;

describe('map generator registry', () => {
  it('exposes generators with unique ids', () => {
    const ids = MAP_GENERATORS.map((generator) => generator.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('looks a generator up by id', () => {
    expect(getGenerator('random').id).toBe('random');
  });

  it('throws on an unknown id', () => {
    expect(() => getGenerator('nope')).toThrow(/Unknown map generator/);
  });
});

// Every generator must satisfy the same contract, so the suite runs over the registry.
describe.each(MAP_GENERATORS)('$name', ({ generate }) => {
  it('returns one byte per cell', () => {
    expect(generate(WIDTH, HEIGHT, 1)).toHaveLength(WIDTH * HEIGHT);
  });

  it('returns only open or blocked cells', () => {
    for (const cell of generate(WIDTH, HEIGHT, 2)) expect(cell === 0 || cell === 1).toBe(true);
  });

  it('is deterministic for a given seed', () => {
    expect(generate(WIDTH, HEIGHT, 42)).toEqual(generate(WIDTH, HEIGHT, 42));
  });

  it('produces different maps for different seeds', () => {
    expect(generate(WIDTH, HEIGHT, 42)).not.toEqual(generate(WIDTH, HEIGHT, 43));
  });

  it('leaves some cells open and blocks some cells', () => {
    const walls = generate(WIDTH, HEIGHT, 7);
    const blocked = walls.reduce((total, cell) => total + cell, 0);
    expect(blocked).toBeGreaterThan(0);
    expect(blocked).toBeLessThan(walls.length);
  });
});

/** Number of separate groups of open cells, found by flood filling with 4-way moves. */
function openRegions(walls: Uint8Array, width: number, height: number): number {
  const seen = new Uint8Array(walls.length);
  let regions = 0;

  for (let origin = 0; origin < walls.length; origin++) {
    if (walls[origin] === 1 || seen[origin] === 1) continue;
    regions++;
    const stack = [origin];
    seen[origin] = 1;
    while (stack.length > 0) {
      const cell = stack.pop()!;
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
        if (walls[neighbor] === 1 || seen[neighbor] === 1) continue;
        seen[neighbor] = 1;
        stack.push(neighbor);
      }
    }
  }
  return regions;
}

// Every generator but `random` promises a map where any open cell can reach any other.
describe.each(MAP_GENERATORS.filter((generator) => generator.id !== 'random'))('$name connectivity', ({ generate }) => {
  it.each([1, 2, 3, 99, 12345])('leaves a single open region with seed %i', (seed) => {
    expect(openRegions(generate(WIDTH, HEIGHT, seed), WIDTH, HEIGHT)).toBe(1);
  });
});

describe('maze', () => {
  const walls = getGenerator('maze').generate(WIDTH, HEIGHT, 4);
  const open = (x: number, y: number) => walls[y * WIDTH + x] === 0;

  it('keeps a wall all the way around the border', () => {
    for (let x = 0; x < WIDTH; x++) expect(open(x, 0) || open(x, HEIGHT - 1)).toBe(false);
    for (let y = 0; y < HEIGHT; y++) expect(open(0, y) || open(WIDTH - 1, y)).toBe(false);
  });

  it('has no open 2x2 block, so every corridor is one cell wide', () => {
    for (let y = 0; y < HEIGHT - 1; y++) {
      for (let x = 0; x < WIDTH - 1; x++) {
        expect(open(x, y) && open(x + 1, y) && open(x, y + 1) && open(x + 1, y + 1)).toBe(false);
      }
    }
  });
});

describe('streets', () => {
  const walls = getGenerator('streets').generate(WIDTH, HEIGHT, 8);

  it('runs every street from edge to edge', () => {
    const fullRows = Array.from({ length: HEIGHT }, (_, y) =>
      Array.from({ length: WIDTH - 2 }, (_, i) => walls[y * WIDTH + i + 1]).every((cell) => cell === 0),
    ).filter(Boolean).length;
    expect(fullRows).toBeGreaterThanOrEqual(2);
  });

  it('leaves solid blocks between the streets', () => {
    const blocked = walls.reduce((total, cell) => total + cell, 0);
    expect(blocked).toBeGreaterThan(walls.length * 0.2);
  });
});

describe('rooms', () => {
  it('carves open areas wider than a corridor', () => {
    const walls = getGenerator('rooms').generate(WIDTH, HEIGHT, 11);
    const open = (x: number, y: number) => walls[y * WIDTH + x] === 0;
    let blocks = 0;
    for (let y = 0; y < HEIGHT - 1; y++) {
      for (let x = 0; x < WIDTH - 1; x++) {
        if (open(x, y) && open(x + 1, y) && open(x, y + 1) && open(x + 1, y + 1)) blocks++;
      }
    }
    expect(blocks).toBeGreaterThan(20);
  });
});

describe('caves', () => {
  // The automaton erodes walls on every pass. Tuned badly it collapses into a single empty
  // room, or eats itself down to a handful of cells; neither is caught by the shared
  // contract above, since both are still one connected region.
  it.each([1, 2, 3, 99, 12345])('keeps between a tenth and three quarters of the map open with seed %i', (seed) => {
    const walls = getGenerator('caves').generate(WIDTH, HEIGHT, seed);
    const open = walls.reduce((total, cell) => total + (cell === 0 ? 1 : 0), 0) / walls.length;
    expect(open).toBeGreaterThan(0.1);
    expect(open).toBeLessThan(0.75);
  });
});
