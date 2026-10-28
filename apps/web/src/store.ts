import { getGenerator } from '@pathlab/core';
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

  /** Blocks or clears a cell. Ignored on the start and goal cells. */
  setWall: (id: number, blocked: boolean) => void;
  moveStart: (id: number) => void;
  moveGoal: (id: number) => void;
}

const INITIAL_GENERATOR = 'rooms';
const INITIAL_SEED = 2024;

export const useStore = create<State>((set, get) => ({
  generatorId: INITIAL_GENERATOR,
  seed: INITIAL_SEED,
  ...createScenario(INITIAL_GENERATOR, INITIAL_SEED),

  setWall: (id, blocked) => {
    const { walls, start, goal } = get();
    if (id === start || id === goal) return;
    if (walls[id] === (blocked ? 1 : 0)) return;
    // A fresh array, because React compares by identity and a mutated one looks unchanged.
    const next = walls.slice();
    next[id] = blocked ? 1 : 0;
    set({ walls: next });
  },

  moveStart: (id) => {
    const { walls, goal } = get();
    if (id === goal || walls[id] !== 0) return;
    set({ start: id });
  },

  moveGoal: (id) => {
    const { walls, start } = get();
    if (id === start || walls[id] !== 0) return;
    set({ goal: id });
  },
}));
