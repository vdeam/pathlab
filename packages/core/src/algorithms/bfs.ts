import type { StepEvent } from '../events.js';
import type { Graph, NodeId } from '../graph.js';
import { buildPath } from './path.js';

/**
 * Breadth-first search: expand the frontier one ring at a time.
 *
 * A plain queue replaces the priority queue, which makes every operation O(1) but blinds the
 * search to edge costs. BFS finds the path with the fewest *steps*, which is the cheapest
 * path only when every step costs the same. With diagonal moves it is no longer optimal,
 * because a diagonal counts as one step but costs more than a straight one.
 */
export function* bfs(graph: Graph, start: NodeId, goal: NodeId): Generator<StepEvent, void, undefined> {
  const g = new Float64Array(graph.nodeCount).fill(Infinity);
  const parent = new Int32Array(graph.nodeCount).fill(-1);

  // An array with a moving head, rather than `shift()`, which is O(n) on every call.
  const queue: NodeId[] = [start];
  let head = 0;

  g[start] = 0;
  yield { type: 'open', node: start, parent: -1, g: 0, h: 0 };

  while (head < queue.length) {
    const node = queue[head++]!;
    yield { type: 'close', node, g: g[node]! };

    if (node === goal) {
      yield { type: 'found', path: buildPath(parent, goal), cost: g[goal]! };
      return;
    }

    for (const { to, cost } of graph.neighbors(node)) {
      // The first time a node is reached is along a shortest path in steps, so there is
      // never a reason to revisit it.
      if (g[to] !== Infinity) continue;
      g[to] = g[node]! + cost;
      parent[to] = node;
      queue.push(to);
      yield { type: 'open', node: to, parent: node, g: g[to]!, h: 0 };
    }
  }

  yield { type: 'not-found' };
}
