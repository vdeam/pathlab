import { describe, expect, it } from 'vitest';
import { GridGraph } from '../src/grid.js';

/** Neighbor ids of `id`, sorted so expectations do not depend on iteration order. */
const neighborIds = (grid: GridGraph, id: number) =>
  [...grid.neighbors(id)].map((edge) => edge.to).sort((a, b) => a - b);

/** A 3x3 grid whose center cell is id 4. */
const grid3x3 = (walls: Uint8Array = new Uint8Array(9), diagonal = false) => new GridGraph(3, 3, walls, { diagonal });

/** A 3x3 wall mask with the given cell ids blocked. */
const wallsAt = (...ids: number[]) => {
  const walls = new Uint8Array(9);
  for (const id of ids) walls[id] = 1;
  return walls;
};

describe('GridGraph', () => {
  it('rejects a wall mask that does not match its dimensions', () => {
    expect(() => new GridGraph(3, 3, new Uint8Array(8))).toThrow(RangeError);
  });

  it('converts between coordinates and node ids', () => {
    const grid = new GridGraph(5, 4, new Uint8Array(20));
    const id = grid.toId(3, 2);
    expect(id).toBe(13);
    expect([grid.toX(id), grid.toY(id)]).toEqual([3, 2]);
  });

  describe('neighbors', () => {
    it('returns 4 orthogonal neighbors by default', () => {
      expect(neighborIds(grid3x3(), 4)).toEqual([1, 3, 5, 7]);
    });

    it('returns 8 neighbors when diagonal movement is enabled', () => {
      expect(neighborIds(grid3x3(undefined, true), 4)).toEqual([0, 1, 2, 3, 5, 6, 7, 8]);
    });

    it('clips at the edges of the grid', () => {
      expect(neighborIds(grid3x3(), 0)).toEqual([1, 3]);
    });

    it('never returns a blocked cell', () => {
      expect(neighborIds(grid3x3(wallsAt(1)), 4)).toEqual([3, 5, 7]);
    });

    it('returns nothing from a fully enclosed cell', () => {
      expect(neighborIds(grid3x3(wallsAt(1, 3, 5, 7)), 4)).toEqual([]);
    });
  });

  describe('costs', () => {
    it('charges 1 for an orthogonal step', () => {
      expect([...grid3x3().neighbors(4)].every((edge) => edge.cost === 1)).toBe(true);
    });

    it('charges the square root of two for a diagonal step', () => {
      const diagonals = [...grid3x3(undefined, true).neighbors(4)].filter((edge) => edge.cost !== 1);
      expect(diagonals).toHaveLength(4);
      expect(diagonals.every((edge) => Math.abs(edge.cost - Math.SQRT2) < 1e-12)).toBe(true);
    });
  });

  describe('corner cutting', () => {
    // Cell 0 is the north-west diagonal of the center; cells 1 and 3 are the orthogonal
    // cells a diagonal step would pass between.
    it('allows a diagonal when both adjacent cells are free', () => {
      expect(neighborIds(grid3x3(wallsAt(), true), 4)).toContain(0);
    });

    it('blocks a diagonal when one adjacent cell is blocked', () => {
      expect(neighborIds(grid3x3(wallsAt(1), true), 4)).not.toContain(0);
    });

    it('blocks a diagonal when both adjacent cells are blocked', () => {
      expect(neighborIds(grid3x3(wallsAt(1, 3), true), 4)).not.toContain(0);
    });

    it('blocks a diagonal into a blocked cell', () => {
      expect(neighborIds(grid3x3(wallsAt(0), true), 4)).not.toContain(0);
    });
  });

  describe('heuristic', () => {
    const grid = (diagonal: boolean) => new GridGraph(10, 10, new Uint8Array(100), { diagonal });

    it('uses Manhattan distance without diagonals', () => {
      const g = grid(false);
      expect(g.heuristic(g.toId(1, 1), g.toId(4, 5))).toBe(7);
    });

    it('uses octile distance with diagonals', () => {
      const g = grid(true);
      // Three diagonal steps plus one straight step.
      expect(g.heuristic(g.toId(1, 1), g.toId(4, 5))).toBeCloseTo(3 * Math.SQRT2 + 1, 10);
    });

    it('is zero when start and goal are the same node', () => {
      expect(grid(false).heuristic(42, 42)).toBe(0);
    });

    it('is symmetric', () => {
      const g = grid(true);
      const a = g.toId(2, 7);
      const b = g.toId(8, 1);
      expect(g.heuristic(a, b)).toBeCloseTo(g.heuristic(b, a), 12);
    });
  });
});
