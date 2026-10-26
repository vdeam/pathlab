import type { StepEvent } from '../events.js';
import type { Graph, NodeId } from '../graph.js';
import { buildPath } from './path.js';

/**
 * Depth-first search: follow one branch as far as it goes before backtracking.
 *
 * Swapping the queue for a stack is the only change from breadth-first search, and it costs
 * every guarantee: the first path DFS finds is usually a rambling one. It is here as a
 * contrast, to show what the frontier ordering alone is responsible for.
 */
export function* dfs(graph: Graph, start: NodeId, goal: NodeId): Generator<StepEvent, void, undefined> {
  const parent = new Int32Array(graph.nodeCount).fill(-1);
  const closed = new Uint8Array(graph.nodeCount);

  // A node can be stacked several times before it is expanded, so each entry carries the
  // neighbor that pushed it. Whichever copy is popped first decides the node's parent.
  const stack: Array<{ node: NodeId; from: NodeId; g: number }> = [{ node: start, from: -1, g: 0 }];
  yield { type: 'open', node: start, parent: -1, g: 0, h: 0 };

  while (stack.length > 0) {
    const { node, from, g } = stack.pop()!;
    if (closed[node]) continue;
    closed[node] = 1;
    parent[node] = from;
    yield { type: 'close', node, g };

    if (node === goal) {
      yield { type: 'found', path: buildPath(parent, goal), cost: g };
      return;
    }

    for (const { to, cost } of graph.neighbors(node)) {
      if (closed[to]) continue;
      stack.push({ node: to, from: node, g: g + cost });
      yield { type: 'open', node: to, parent: node, g: g + cost, h: 0 };
    }
  }

  yield { type: 'not-found' };
}
