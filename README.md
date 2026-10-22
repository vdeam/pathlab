# Pathlab

An interactive laboratory for pathfinding algorithms. Draw a map, pick an algorithm, and watch exactly how it
searches, then compare algorithms on the same scenario using measured results.

> **Status:** early development. Phase 1 (MVP) in progress.

## Goals

Most pathfinding visualizers answer _what_ an algorithm does. Pathlab is built to answer _why_: every run is
recorded step by step, so searches can be replayed, rewound, compared side by side and measured on identical
scenarios.

## Roadmap

**Phase 1 — MVP.** Grid editor with start, goal and obstacles. Step-by-step execution. Visualization of explored
nodes and the final path. Algorithm and animation speed selection. Seeded map generation, so any scenario can be
reproduced exactly.

**Phase 2 — Algorithm lab.** Two algorithms compared on the same scenario. Measured path cost, explored nodes,
execution time and estimated memory. Configurable diagonal movement, without corner cutting. Scenario import and
export as JSON. Heuristic selection and a Weighted A\* slider.

**Phase 3 — Pro lab.** Large maps with optimized rendering. Obstacles that change while a search is running, and
replanning algorithms such as D\* Lite. A custom graph editor alongside grids. Repeatable benchmarks across
multiple maps and seeds, exported as CSV.

Each phase closes a version: `v0.1.0`, `v0.2.0`, `v0.3.0`, then `v1.0.0` once the project is stable.

## Getting started

Requires Node.js 20 or newer (see `.nvmrc`).

```sh
npm install
npm test              # Vitest
npm run typecheck     # TypeScript
npm run lint          # ESLint
npm run format:check  # Prettier
```

## Project layout

```
packages/core   UI-free graph model and algorithms
apps/web        Front end that renders and drives the core (planned)
```

Algorithms depend only on a `Graph` interface — `neighbors`, `heuristic` and `nodeCount` — and are written as
generators that yield immutable step events. A grid is just one implementation of that interface, so every
algorithm works unchanged on any other kind of map.

## Development

Work happens on `feature/*` branches cut from `dev`, with [Conventional Commits](https://www.conventionalcommits.org/)
messages. Pull requests merge into `dev` with rebase and merge, so each commit is preserved. Releases are cut from
`dev` into `main` and tagged.

## License

[MIT](LICENSE)
