import type { NodeId, SearchResult } from '@pathlab/core';

export const CellState = { None: 0, Frontier: 1, Explored: 2 } as const;

export interface SearchView {
  /** One entry per node, holding a `CellState`. */
  readonly state: Uint8Array;
  readonly path: readonly NodeId[] | null;
  readonly expanded: number;
  readonly queued: number;
  readonly cost: number | null;
  /** True once the search has given up, which means no path exists. */
  readonly exhausted: boolean;
}

/**
 * Replays the first `steps` events of a recorded search and reports what the grid should
 * show at that moment.
 *
 * Rebuilding from the events rather than keeping a running copy is what makes the timeline
 * work in both directions: any step is reachable from the recording alone.
 */
export function viewAt(result: SearchResult, steps: number, nodeCount: number): SearchView {
  const state = new Uint8Array(nodeCount);
  let path: readonly NodeId[] | null = null;
  let expanded = 0;
  let queued = 0;
  let cost: number | null = null;
  let exhausted = false;

  const end = Math.min(steps, result.events.length);
  for (let i = 0; i < end; i++) {
    const event = result.events[i]!;
    switch (event.type) {
      case 'open':
        state[event.node] = CellState.Frontier;
        queued++;
        break;
      case 'close':
        state[event.node] = CellState.Explored;
        expanded++;
        break;
      case 'found':
        path = event.path;
        cost = event.cost;
        break;
      case 'not-found':
        exhausted = true;
        break;
    }
  }

  return { state, path, expanded, queued, cost, exhausted };
}
