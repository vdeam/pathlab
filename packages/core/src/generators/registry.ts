import { caves } from './caves.js';
import { maze } from './maze.js';
import { randomObstacles } from './random.js';
import { rooms } from './rooms.js';
import { streets } from './streets.js';

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
  {
    id: 'maze',
    name: 'Maze',
    summary: 'One-cell corridors with a single route between any two points.',
    generate: maze,
  },
  {
    id: 'rooms',
    name: 'Rooms',
    summary: 'Open rooms joined by corridors. Every route passes through a doorway.',
    generate: rooms,
  },
  {
    id: 'streets',
    name: 'Streets',
    summary: 'City blocks on a street grid, with many routes of equal length.',
    generate: streets,
  },
  {
    id: 'caves',
    name: 'Caves',
    summary: 'Organic caverns with dead ends, grown from smoothed noise.',
    generate: caves,
  },
];

export function getGenerator(id: string): GeneratorInfo {
  const found = MAP_GENERATORS.find((generator) => generator.id === id);
  if (!found) throw new Error(`Unknown map generator: ${id}`);
  return found;
}
