import { ALGORITHMS, getGenerator, randomSeed } from '@pathlab/core';
import { create } from 'zustand';
import { nearestOpenCell } from './lib/placement.js';

/** Odd dimensions, so maze corridors land on the lattice without a clipped last row. */
export const GRID_WIDTH = 49;
export const GRID_HEIGHT = 29;

interface Scenario {
  readonly walls: Uint8Array;
  readonly start: number;
  readonly goal: number;
}

function createScenario(generatorId: string, seed: number): Scenario {
  const walls = getGenerator(generatorId).generate(GRID_WIDTH, GRID_HEIGHT, seed);
  const middleRow = Math.floor(GRID_HEIGHT / 2);
  return {
    walls,
    start: nearestOpenCell(walls, GRID_WIDTH, 2, middleRow),
    goal: nearestOpenCell(walls, GRID_WIDTH, GRID_WIDTH - 3, middleRow),
  };
}

interface State extends Scenario {
  readonly generatorId: string;
  readonly seed: number;
  readonly algorithmId: string;
  /** Allow 8-directional movement. Corners are never cut either way. */
  readonly diagonal: boolean;

  /** How many recorded steps to replay, or null to show the finished search. */
  readonly cursor: number | null;
  readonly playing: boolean;
  /** Playback speed, 0 to 60, read through `eventsPerSecond`. */
  readonly speed: number;

  /** Blocks or clears a cell. Ignored on the start and goal cells. */
  setWall: (id: number, blocked: boolean) => void;
  moveStart: (id: number) => void;
  moveGoal: (id: number) => void;
  /** Rebuilds the map with the given generator, keeping the current seed. */
  setGenerator: (generatorId: string) => void;
  /** Rebuilds the map with the same generator and a fresh seed. */
  shuffleSeed: () => void;
  /** Empties the map, leaving the markers where they are. */
  clearWalls: () => void;
  setAlgorithm: (algorithmId: string) => void;
  setDiagonal: (diagonal: boolean) => void;
  setCursor: (cursor: number | null) => void;
  setPlaying: (playing: boolean) => void;
  setSpeed: (speed: number) => void;
}

/**
 * Editing the scenario produces a different recording, so the old position in it means
 * nothing. Every change rewinds to the finished result and stops playback.
 */
const REWOUND = { cursor: null, playing: false } as const;

const INITIAL_GENERATOR = 'rooms';
const INITIAL_SEED = 2024;

export const useStore = create<State>((set, get) => ({
  generatorId: INITIAL_GENERATOR,
  seed: INITIAL_SEED,
  algorithmId: ALGORITHMS[0]!.id,
  diagonal: false,
  cursor: null,
  playing: false,
  speed: 34,
  ...createScenario(INITIAL_GENERATOR, INITIAL_SEED),

  setWall: (id, blocked) => {
    const { walls, start, goal } = get();
    if (id === start || id === goal) return;
    if (walls[id] === (blocked ? 1 : 0)) return;
    // A fresh array, because React compares by identity and a mutated one looks unchanged.
    const next = walls.slice();
    next[id] = blocked ? 1 : 0;
    set({ walls: next, ...REWOUND });
  },

  moveStart: (id) => {
    const { walls, goal } = get();
    if (id === goal || walls[id] !== 0) return;
    set({ start: id, ...REWOUND });
  },

  moveGoal: (id) => {
    const { walls, start } = get();
    if (id === start || walls[id] !== 0) return;
    set({ goal: id, ...REWOUND });
  },

  // Regenerating replaces the markers too, since the old cells may now be walls.
  setGenerator: (generatorId) => set({ generatorId, ...createScenario(generatorId, get().seed), ...REWOUND }),

  shuffleSeed: () => {
    const seed = randomSeed();
    set({ seed, ...createScenario(get().generatorId, seed), ...REWOUND });
  },

  clearWalls: () => set({ walls: new Uint8Array(GRID_WIDTH * GRID_HEIGHT), ...REWOUND }),

  setAlgorithm: (algorithmId) => set({ algorithmId, ...REWOUND }),
  setDiagonal: (diagonal) => set({ diagonal, ...REWOUND }),
  setCursor: (cursor) => set({ cursor }),
  setPlaying: (playing) => set({ playing }),
  setSpeed: (speed) => set({ speed }),
}));

/**
 * Steps per second for a slider position.
 *
 * Exponential, because a linear scale wastes most of its travel: the interesting range runs
 * from a few steps per second, slow enough to follow by eye, to thousands, fast enough to
 * finish a large map at once.
 */
export function eventsPerSecond(speed: number): number {
  return 4 * Math.pow(1.12, speed);
}
