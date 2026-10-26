import type { SearchOptions, StepEvent } from '../events.js';
import type { Graph, NodeId } from '../graph.js';
import { MinHeap } from '../heap.js';
import { buildPath } from './path.js';

/** How much the cost so far and the heuristic each count towards a node's priority. */
interface Weights {
  /** Multiplier of the cost so far. Zero ignores it, which is what makes a search greedy. */
  g: number;
  /** Multiplier of the heuristic. Zero ignores it, which turns A\* back into Dijkstra. */
  h: number;
}

/**
 * Best-first search: repeatedly expand the most promising node in the frontier.
 *
 * Dijkstra, A\*, Weighted A\* and Greedy Best-First are all this one algorithm with
 * different weights, so they are implemented once instead of four times.
 */
function* bestFirst(
  graph: Graph,
  start: NodeId,
  goal: NodeId,
  weights: Weights,
): Generator<StepEvent, void, undefined> {
  const g = new Float64Array(graph.nodeCount).fill(Infinity);
  const parent = new Int32Array(graph.nodeCount).fill(-1);
  const closed = new Uint8Array(graph.nodeCount);
  const frontier = new MinHeap();

  g[start] = 0;
  const startH = graph.heuristic(start, goal);
  frontier.push(start, weights.h * startH, startH);
  yield { type: 'open', node: start, parent: -1, g: 0, h: startH };

  while (frontier.size > 0) {
    const node = frontier.pop();
    // The heap has no decrease-key, so a node can appear more than once. The first time it
    // comes out carries its best cost; later copies are stale and already closed.
    if (closed[node]) continue;
    closed[node] = 1;
    yield { type: 'close', node, g: g[node]! };

    if (node === goal) {
      yield { type: 'found', path: buildPath(parent, goal), cost: g[goal]! };
      return;
    }

    for (const { to, cost } of graph.neighbors(node)) {
      if (closed[to]) continue;
      const candidate = g[node]! + cost;
      if (candidate >= g[to]!) continue;

      g[to] = candidate;
      parent[to] = node;
      const h = graph.heuristic(to, goal);
      // Ties are broken towards the node closest to the goal, which keeps the frontier from
      // fanning out across equally good options.
      frontier.push(to, weights.g * candidate + weights.h * h, h);
      yield { type: 'open', node: to, parent: node, g: candidate, h };
    }
  }

  yield { type: 'not-found' };
}

/**
 * Expands the cheapest node first, ignoring where the goal is.
 *
 * Always finds the cheapest path, at the cost of exploring in every direction.
 */
export function dijkstra(graph: Graph, start: NodeId, goal: NodeId): Generator<StepEvent, void, undefined> {
  return bestFirst(graph, start, goal, { g: 1, h: 0 });
}

/**
 * Weighs the cost so far against an estimate of the cost remaining.
 *
 * With an admissible heuristic and a weight of 1, A\* finds the same cheapest path as
 * Dijkstra while expanding far fewer nodes. A weight above 1 trades that guarantee for
 * speed: the path can cost up to `weight` times the optimum, and usually costs much less.
 */
export function aStar(
  graph: Graph,
  start: NodeId,
  goal: NodeId,
  options: SearchOptions = {},
): Generator<StepEvent, void, undefined> {
  return bestFirst(graph, start, goal, { g: 1, h: options.weight ?? 1 });
}

/**
 * Follows the heuristic alone, ignoring how much the journey has already cost.
 *
 * Reaches the goal quickly in open space and commits badly to dead ends, so the path it
 * returns can be far from optimal.
 */
export function greedyBestFirst(graph: Graph, start: NodeId, goal: NodeId): Generator<StepEvent, void, undefined> {
  return bestFirst(graph, start, goal, { g: 0, h: 1 });
}
