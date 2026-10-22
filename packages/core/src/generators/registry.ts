import { randomObstacles } from './random.js';

/** Builds a wall mask for a `width x height` grid. The same seed always yields the same map. */
export type MapGenerator = (width: number, height: number, seed: number) => Uint8Array;

export interface GeneratorInfo {
  readonly id: string;
  readonly name: string;
  readonly summary: string;
  readonly generate: MapGenerator;
}

export const MAP_GENERATORS: readonly GeneratorInfo[] = [
  {
    id: 'random',
    name: 'Random obstacles',
    summary: 'Scattered walls in open space. Shows how much a heuristic saves.',
    generate: randomObstacles,
  },
];

export function getGenerator(id: string): GeneratorInfo {
  const found = MAP_GENERATORS.find((generator) => generator.id === id);
  if (!found) throw new Error(`Unknown map generator: ${id}`);
  return found;
}
