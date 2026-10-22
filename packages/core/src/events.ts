import type { Graph, NodeId } from './graph.js';

/**
 * One recorded step of a search.
 *
 * Algorithms are generators of these events rather than functions that return a path.
 * Recording the events is what makes stepping, rewinding, side-by-side comparison and
 * benchmarking work the same way for every algorithm.
 */
export type StepEvent =
  /** A node was discovered, or rediscovered with a cheaper cost, and queued. */
  | { readonly type: 'open'; readonly node: NodeId; readonly parent: NodeId; readonly g: number; readonly h: number }
  /** A node was expanded. Its cost is final as far as this algorithm is concerned. */
  | { readonly type: 'close'; readonly node: NodeId; readonly g: number }
  /** The goal was reached. `path` runs from start to goal, inclusive. */
  | { readonly type: 'found'; readonly path: readonly NodeId[]; readonly cost: number }
  /** The frontier was exhausted without reaching the goal. */
  | { readonly type: 'not-found' };

export interface SearchOptions {
  /** Heuristic weight, used by Weighted A\*. Defaults to 1. */
  weight?: number;
}

/** The shape every algorithm in the registry implements. */
export type SearchRun = (
  graph: Graph,
  start: NodeId,
  goal: NodeId,
  options?: SearchOptions,
) => Generator<StepEvent, void, undefined>;
