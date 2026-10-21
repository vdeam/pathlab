# Pathlab

An interactive laboratory for pathfinding algorithms. Draw a map, pick an algorithm, and watch exactly how it
searches, then compare algorithms on the same scenario using measured results.

> **Status:** early development. Phase 1 (MVP) in progress — see the [roadmap](docs/ROADMAP.md).

## Goals

Most pathfinding visualizers answer _what_ an algorithm does. Pathlab is built to answer _why_: every run is
recorded step by step, so searches can be replayed, rewound, compared side by side and measured on identical
scenarios.

## Getting started

Requires Node.js 20 or newer (see `.nvmrc`).

```sh
npm install
npm run lint          # ESLint
npm run format:check  # Prettier
```

More scripts will appear here as the project grows.

## Project layout

```
packages/core   UI-free graph model and algorithms (planned)
apps/web        Front end that renders and drives the core (planned)
docs/           Roadmap and working notes
```

## Documentation

- [Roadmap](docs/ROADMAP.md) — the three planned phases
- [Git workflow](docs/GIT_WORKFLOW.md) — branching, commit and release conventions

## License

[MIT](LICENSE)
