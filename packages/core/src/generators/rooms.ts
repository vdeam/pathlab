import { Rng } from '../rng.js';

/** A partition is only split while both halves would still fit a room with margin. */
const MIN_LEAF = 8;
const MIN_ROOM = 3;

/**
 * Rooms joined by corridors, laid out with binary space partitioning.
 *
 * The classic dungeon layout: open areas connected through narrow doorways. Those doorways
 * are bottlenecks every route has to pass through, which is where Greedy Best-First tends to
 * commit to the wrong room and have to come back.
 */
export function rooms(width: number, height: number, seed: number): Uint8Array {
  const walls = new Uint8Array(width * height).fill(1);
  const rng = new Rng(seed);
  const at = (x: number, y: number) => y * width + x;

  /** Clamped so callers never have to reason about the grid edges. */
  const carveRect = (x: number, y: number, w: number, h: number) => {
    for (let j = Math.max(0, y); j < Math.min(height, y + h); j++) {
      for (let i = Math.max(0, x); i < Math.min(width, x + w); i++) walls[at(i, j)] = 0;
    }
  };

  /** An L-shaped corridor: horizontal along `a`, then vertical along `b`. */
  const carveCorridor = ([ax, ay]: [number, number], [bx, by]: [number, number]) => {
    for (let x = Math.min(ax, bx); x <= Math.max(ax, bx); x++) walls[at(x, ay)] = 0;
    for (let y = Math.min(ay, by); y <= Math.max(ay, by); y++) walls[at(bx, y)] = 0;
  };

  /**
   * Splits the area recursively and returns a point inside the carved space.
   *
   * Each level connects its two halves, so the whole layout is connected by induction.
   */
  const partition = (x: number, y: number, w: number, h: number): [number, number] => {
    const canSplitVertically = w >= MIN_LEAF * 2;
    const canSplitHorizontally = h >= MIN_LEAF * 2;

    if (!canSplitVertically && !canSplitHorizontally) {
      const insetX = 1 + rng.int(2);
      const insetY = 1 + rng.int(2);
      const roomW = Math.max(MIN_ROOM, w - insetX * 2);
      const roomH = Math.max(MIN_ROOM, h - insetY * 2);
      const roomX = x + Math.min(insetX, Math.max(0, w - roomW));
      const roomY = y + Math.min(insetY, Math.max(0, h - roomH));
      carveRect(roomX, roomY, roomW, roomH);
      return [roomX + (roomW >> 1), roomY + (roomH >> 1)];
    }

    const vertical = canSplitVertically && (!canSplitHorizontally || rng.chance(0.5));
    const extent = vertical ? w : h;
    const cut = MIN_LEAF + rng.int(extent - MIN_LEAF * 2 + 1);

    const first = vertical ? partition(x, y, cut, h) : partition(x, y, w, cut);
    const second = vertical ? partition(x + cut, y, w - cut, h) : partition(x, y + cut, w, h - cut);
    carveCorridor(first, second);
    return rng.chance(0.5) ? first : second;
  };

  partition(1, 1, width - 2, height - 2);
  return walls;
}
