import type { Edge, Graph, NodeId } from './graph.js';

export interface GridOptions {
  /** Allow 8-directional movement. */
  diagonal: boolean;
}

const ORTHOGONAL = [
  [0, -1],
  [1, 0],
  [0, 1],
  [-1, 0],
] as const;

const DIAGONAL = [
  [1, -1],
  [1, 1],
  [-1, 1],
  [-1, -1],
] as const;

/**
 * A rectangular grid of open and blocked cells, exposed to algorithms as a plain `Graph`.
 *
 * All the grid-specific rules live here: how cells connect, what a step costs and how
 * distance is estimated. Algorithms never see any of it.
 */
export class GridGraph implements Graph {
  readonly nodeCount: number;

  /**
   * @param walls One byte per cell, in row-major order. A non-zero byte is a blocked cell.
   */
  constructor(
    readonly width: number,
    readonly height: number,
    readonly walls: Uint8Array,
    readonly options: GridOptions = { diagonal: false },
  ) {
    if (walls.length !== width * height) {
      throw new RangeError(`walls length ${walls.length} does not match ${width}x${height}`);
    }
    this.nodeCount = width * height;
  }

  toId(x: number, y: number): NodeId {
    return y * this.width + x;
  }

  toX(id: NodeId): number {
    return id % this.width;
  }

  toY(id: NodeId): number {
    return Math.floor(id / this.width);
  }

  inBounds(x: number, y: number): boolean {
    return x >= 0 && y >= 0 && x < this.width && y < this.height;
  }

  isWalkable(x: number, y: number): boolean {
    return this.inBounds(x, y) && this.walls[y * this.width + x] === 0;
  }

  *neighbors(id: NodeId): Iterable<Edge> {
    const x = this.toX(id);
    const y = this.toY(id);

    for (const [dx, dy] of ORTHOGONAL) {
      if (this.isWalkable(x + dx, y + dy)) {
        yield { to: this.toId(x + dx, y + dy), cost: 1 };
      }
    }

    if (!this.options.diagonal) return;

    for (const [dx, dy] of DIAGONAL) {
      if (!this.isWalkable(x + dx, y + dy)) continue;
      // Corners are never cut: a diagonal step needs both adjacent orthogonal cells free,
      // so a path can never slip through the seam between two walls.
      if (!this.isWalkable(x + dx, y) || !this.isWalkable(x, y + dy)) continue;
      yield { to: this.toId(x + dx, y + dy), cost: Math.SQRT2 };
    }
  }

  /**
   * Manhattan distance for 4-way movement, octile distance for 8-way.
   *
   * Both are admissible: they are exactly the cost of the shortest path on an empty grid,
   * and walls can only make the real path longer.
   */
  heuristic(from: NodeId, to: NodeId): number {
    const dx = Math.abs(this.toX(from) - this.toX(to));
    const dy = Math.abs(this.toY(from) - this.toY(to));
    if (!this.options.diagonal) return dx + dy;
    return dx + dy + (Math.SQRT2 - 2) * Math.min(dx, dy);
  }
}
