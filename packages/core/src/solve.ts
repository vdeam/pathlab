import type { SearchOptions, SearchRun, StepEvent } from './events.js';
import type { Graph, NodeId } from './graph.js';

export interface SearchResult {
  /** Every step the search took, in order. Replaying a prefix reproduces any moment of it. */
  readonly events: readonly StepEvent[];
  readonly found: boolean;
  readonly path: readonly NodeId[];
  /** Cost of `path`, or `Infinity` when no path was found. */
  readonly cost: number;
  /** Nodes expanded. The usual measure of how much work a search did. */
  readonly expanded: number;
  /** Nodes queued, counting a node once per time it entered the frontier. */
  readonly generated: number;
}

/** Runs a search to completion and records it. */
export function solve(
  graph: Graph,
  start: NodeId,
  goal: NodeId,
  run: SearchRun,
  options?: SearchOptions,
): SearchResult {
  const events: StepEvent[] = [];
  let found = false;
  let path: readonly NodeId[] = [];
  let cost = Infinity;
  let expanded = 0;
  let generated = 0;

  for (const event of run(graph, start, goal, options)) {
    events.push(event);
    switch (event.type) {
      case 'open':
        generated++;
        break;
      case 'close':
        expanded++;
        break;
      case 'found':
        found = true;
        path = event.path;
        cost = event.cost;
        break;
      case 'not-found':
        break;
    }
  }

  return { events, found, path, cost, expanded, generated };
}
