import { describe, expect, it } from 'vitest';
import { Rng } from '../src/rng.js';

const take = (seed: number, count: number) => {
  const rng = new Rng(seed);
  return Array.from({ length: count }, () => rng.next());
};

describe('Rng', () => {
  it('produces the same sequence for the same seed', () => {
    expect(take(12345, 20)).toEqual(take(12345, 20));
  });

  it('produces different sequences for different seeds', () => {
    expect(take(1, 20)).not.toEqual(take(2, 20));
  });

  it('stays within [0, 1)', () => {
    for (const value of take(99, 1000)) {
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });

  it('does not get stuck on a single value', () => {
    expect(new Set(take(7, 500)).size).toBeGreaterThan(450);
  });

  it('is roughly uniform', () => {
    const buckets = new Array(10).fill(0);
    for (const value of take(2024, 10_000)) buckets[Math.floor(value * 10)]++;
    // A fair generator puts ~1000 in each bucket; allow a generous margin.
    for (const count of buckets) expect(count).toBeGreaterThan(800);
  });

  it('treats seed 0 as a valid seed', () => {
    expect(take(0, 10)).toHaveLength(10);
    expect(new Set(take(0, 10)).size).toBeGreaterThan(1);
  });

  describe('chance', () => {
    it('is always false at probability 0 and always true at probability 1', () => {
      const rng = new Rng(5);
      for (let i = 0; i < 100; i++) {
        expect(rng.chance(0)).toBe(false);
        expect(rng.chance(1)).toBe(true);
      }
    });

    it('fires at roughly the requested rate', () => {
      const rng = new Rng(31);
      let hits = 0;
      for (let i = 0; i < 10_000; i++) if (rng.chance(0.3)) hits++;
      expect(hits).toBeGreaterThan(2700);
      expect(hits).toBeLessThan(3300);
    });
  });
});
