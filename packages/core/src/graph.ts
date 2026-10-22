/** Nodes are dense integers in `[0, nodeCount)` so algorithms can index typed arrays with them. */
export type NodeId = number;

export interface Edge {
  readonly to: NodeId;
  readonly cost: number;
}

/**
 * The only thing a search algorithm knows about the world.
 *
 * Grids, hex maps and hand-built graphs are all just implementations of this interface,
 * which is why every algorithm works on all of them without modification.
 */
export interface Graph {
  readonly nodeCount: number;
  /** Outgoing edges of `node`. Costs must be positive. */
  neighbors(node: NodeId): Iterable<Edge>;
  /** Estimated remaining cost from `from` to `to`. Must never overestimate. */
  heuristic(from: NodeId, to: NodeId): number;
}
