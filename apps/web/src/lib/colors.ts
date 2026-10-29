/**
 * The canvas cannot use CSS variables, so it reads them once per draw and paints with the
 * same tokens as the rest of the interface. Keeping one source of truth means a change to
 * `styles.css` reaches the grid too.
 */
export interface GridTokens {
  readonly cell: string;
  readonly wall: string;
  readonly gridLine: string;
  readonly background: string;
  readonly ink: string;
  readonly accent: string;
  readonly frontier: string;
  readonly explored: string;
  readonly path: string;
  readonly fontMono: string;
}

export function readGridTokens(): GridTokens {
  const style = getComputedStyle(document.documentElement);
  const token = (name: string) => style.getPropertyValue(name).trim();
  return {
    cell: token('--cell'),
    wall: token('--wall'),
    gridLine: token('--grid-line'),
    background: token('--bg'),
    ink: token('--ink'),
    accent: token('--accent'),
    frontier: token('--frontier'),
    explored: token('--explored'),
    path: token('--path'),
    fontMono: token('--font-mono'),
  };
}
