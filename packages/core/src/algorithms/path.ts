import type { NodeId } from '../graph.js';

/** Walks the `parent` links back from `goal` and returns the path from start to goal. */
export function buildPath(parent: Int32Array, goal: NodeId): NodeId[] {
  const path: NodeId[] = [];
  for (let node = goal; node !== -1; node = parent[node]!) path.push(node);
  return path.reverse();
}
