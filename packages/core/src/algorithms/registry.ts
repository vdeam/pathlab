import type { SearchOptions, SearchRun, StepEvent } from '../events.js';
import type { Graph, NodeId } from '../graph.js';
import { aStar, dijkstra, greedyBestFirst } from './best-first.js';
import { bfs } from './bfs.js';
import { dfs } from './dfs.js';

export interface AlgorithmInfo {
  readonly id: string;
  readonly name: string;
  readonly summary: string;
  /** Always finds the cheapest path, whatever the edge costs. */
  readonly optimal: boolean;
  readonly run: SearchRun;
}

/** Adapts a fixed-arity generator function to the `SearchRun` shape every entry shares. */
function fixed(run: (graph: Graph, start: NodeId, goal: NodeId) => Generator<StepEvent, void, undefined>): SearchRun {
  return (graph, start, goal, _options?: SearchOptions) => run(graph, start, goal);
}

export const ALGORITHMS: readonly AlgorithmInfo[] = [
  {
    id: 'astar',
    name: 'A*',
    summary: 'Balances cost so far against a heuristic estimate of what remains.',
    optimal: true,
    run: aStar,
  },
  {
    id: 'dijkstra',
    name: 'Dijkstra',
    summary: 'Expands the cheapest node first, in every direction.',
    optimal: true,
    run: fixed(dijkstra),
  },
  {
    id: 'greedy',
    name: 'Greedy Best-First',
    summary: 'Chases the heuristic alone. Fast, but the path can be far from optimal.',
    optimal: false,
    run: fixed(greedyBestFirst),
  },
  {
    id: 'bfs',
    name: 'Breadth-First',
    summary: 'Explores ring by ring. Fewest steps, blind to edge costs.',
    optimal: false,
    run: fixed(bfs),
  },
  {
    id: 'dfs',
    name: 'Depth-First',
    summary: 'Dives down one branch before backtracking. Rarely a short path.',
    optimal: false,
    run: fixed(dfs),
  },
];

export function getAlgorithm(id: string): AlgorithmInfo {
  const found = ALGORITHMS.find((algorithm) => algorithm.id === id);
  if (!found) throw new Error(`Unknown algorithm: ${id}`);
  return found;
}
