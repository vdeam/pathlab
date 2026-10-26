import { Rng } from '../rng.js';

const MIN_BLOCK = 4;
const MAX_BLOCK = 9;

/**
 * A city grid: buildings separated by streets of irregular block sizes.
 *
 * Every street spans the map, so the layout is always connected and offers many routes of
 * exactly the same length. That makes it the map where tie-breaking shows: without it, an
 * algorithm wanders across equally good alternatives instead of committing to one.
 */
export function streets(width: number, height: number, seed: number): Uint8Array {
  const walls = new Uint8Array(width * height).fill(1);
  const rng = new Rng(seed);
  const at = (x: number, y: number) => y * width + x;

  /** Street positions along one axis, one inset from each edge and random gaps between. */
  const streetLines = (extent: number): number[] => {
    if (extent < 5) return [1];
    const lines = [1];
    for (let pos = 1; ;) {
      pos += MIN_BLOCK + rng.int(MAX_BLOCK - MIN_BLOCK + 1) + 1;
      if (pos >= extent - 2) break;
      lines.push(pos);
    }
    if (lines[lines.length - 1] !== extent - 2) lines.push(extent - 2);
    return lines;
  };

  for (const y of streetLines(height)) {
    for (let x = 1; x < width - 1; x++) walls[at(x, y)] = 0;
  }
  for (const x of streetLines(width)) {
    for (let y = 1; y < height - 1; y++) walls[at(x, y)] = 0;
  }

  return walls;
}
