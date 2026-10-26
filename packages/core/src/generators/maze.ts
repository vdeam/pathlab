import { Rng } from '../rng.js';

/**
 * A perfect maze, carved with the recursive backtracker algorithm.
 *
 * Every open cell is reachable and there is exactly one route between any two of them.
 * Corridors are a single cell wide, which is the hardest case for a heuristic: the goal is
 * often close in a straight line but far along the only legal path, so A\* degenerates
 * towards Dijkstra.
 */
export function maze(width: number, height: number, seed: number): Uint8Array {
  const walls = new Uint8Array(width * height).fill(1);
  if (width < 5 || height < 5) return walls;

  const rng = new Rng(seed);
  const at = (x: number, y: number) => y * width + x;
  // Cells live on odd coordinates; the even ones in between are carved as passages.
  const carvable = (x: number, y: number) => x > 0 && y > 0 && x < width - 1 && y < height - 1;

  walls[at(1, 1)] = 0;
  const stack: Array<[number, number]> = [[1, 1]];
  const steps = [
    [0, -2],
    [2, 0],
    [0, 2],
    [-2, 0],
  ] as const;

  while (stack.length > 0) {
    const [x, y] = stack[stack.length - 1]!;
    const options = steps.filter(([dx, dy]) => carvable(x + dx, y + dy) && walls[at(x + dx, y + dy)] === 1);

    if (options.length === 0) {
      stack.pop();
      continue;
    }

    const [dx, dy] = options[rng.int(options.length)]!;
    walls[at(x + dx / 2, y + dy / 2)] = 0; // knock down the wall between the two cells
    walls[at(x + dx, y + dy)] = 0;
    stack.push([x + dx, y + dy]);
  }

  return walls;
}
