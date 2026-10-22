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
