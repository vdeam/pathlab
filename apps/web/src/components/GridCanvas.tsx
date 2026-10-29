import { useEffect, useRef, useState } from 'react';
import { readGridTokens } from '../lib/colors.js';
import { CellState } from '../lib/view.js';

export interface GridCanvasProps {
  /** Columns and rows of the grid. */
  readonly width: number;
  readonly height: number;
  /** One byte per cell, row-major. A non-zero byte is a blocked cell. */
  readonly walls: Uint8Array;
  readonly start: number;
  readonly goal: number;
  /** One `CellState` per node: what the search has done with it so far. */
  readonly state: Uint8Array;
  /** The route found, drawn on top of everything else. */
  readonly path: readonly number[] | null;
  readonly onSetWall: (id: number, blocked: boolean) => void;
  readonly onMoveStart: (id: number) => void;
  readonly onMoveGoal: (id: number) => void;
}

/** Below this, the gridlines crowd the cells and are better left out. */
const MIN_CELL_FOR_GRIDLINES = 7;
/** Below this, the S and G letters are no longer legible. */
const MIN_CELL_FOR_LABELS = 12;

/** What the current drag is doing. Fixed on pointer down and kept until pointer up. */
type Drag = { kind: 'start' } | { kind: 'goal' } | { kind: 'paint'; blocked: boolean } | null;

export function GridCanvas({
  width,
  height,
  walls,
  start,
  goal,
  state,
  path,
  onSetWall,
  onMoveStart,
  onMoveGoal,
}: GridCanvasProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drag = useRef<Drag>(null);
  const lastCell = useRef<number | null>(null);
  const [cellSize, setCellSize] = useState(16);

  // The grid fills whatever width the stage gives it, so the cell size follows the layout.
  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    const observer = new ResizeObserver(([entry]) => {
      if (entry) setCellSize(Math.max(4, Math.floor(entry.contentRect.width / width)));
    });
    observer.observe(wrapper);
    return () => observer.disconnect();
  }, [width]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context) return;

    // Back the canvas with device pixels so the one-pixel gridlines stay sharp.
    const ratio = window.devicePixelRatio || 1;
    const pixelWidth = width * cellSize;
    const pixelHeight = height * cellSize;
    canvas.width = pixelWidth * ratio;
    canvas.height = pixelHeight * ratio;
    canvas.style.width = `${pixelWidth}px`;
    canvas.style.height = `${pixelHeight}px`;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);

    const tokens = readGridTokens();
    const onPath = path ? new Set(path) : null;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const id = y * width + x;
        // Later states paint over earlier ones: a cell on the path shows as path even
        // though it was explored on the way there.
        let fill = tokens.cell;
        if (walls[id] !== 0) fill = tokens.wall;
        else if (onPath?.has(id)) fill = tokens.path;
        else if (state[id] === CellState.Explored) fill = tokens.explored;
        else if (state[id] === CellState.Frontier) fill = tokens.frontier;
        context.fillStyle = fill;
        context.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
      }
    }

    if (cellSize >= MIN_CELL_FOR_GRIDLINES) {
      context.strokeStyle = tokens.gridLine;
      context.lineWidth = 1;
      context.beginPath();
      // The half-pixel offset puts the stroke on the pixel rather than across two of them.
      for (let x = 0; x <= width; x++) {
        context.moveTo(x * cellSize + 0.5, 0);
        context.lineTo(x * cellSize + 0.5, pixelHeight);
      }
      for (let y = 0; y <= height; y++) {
        context.moveTo(0, y * cellSize + 0.5);
        context.lineTo(pixelWidth, y * cellSize + 0.5);
      }
      context.stroke();
    }

    const drawMarker = (id: number, fill: string, label: string) => {
      const centerX = (id % width) * cellSize + cellSize / 2;
      const centerY = Math.floor(id / width) * cellSize + cellSize / 2;
      const radius = cellSize * 0.34;

      context.fillStyle = fill;
      context.beginPath();
      context.arc(centerX, centerY, radius, 0, Math.PI * 2);
      context.fill();
      context.strokeStyle = tokens.background;
      context.lineWidth = 2;
      context.stroke();

      if (cellSize < MIN_CELL_FOR_LABELS) return;
      context.fillStyle = tokens.background;
      context.font = `600 ${Math.round(cellSize * 0.5)}px ${tokens.fontMono}`;
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.fillText(label, centerX, centerY + 0.5);
    };

    drawMarker(start, tokens.ink, 'S');
    drawMarker(goal, tokens.goal, 'G');
  }, [width, height, walls, start, goal, state, path, cellSize]);

  /** The cell under the pointer, or null when it falls outside the grid. */
  const cellAt = (event: React.PointerEvent): number | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const bounds = canvas.getBoundingClientRect();
    const x = Math.floor((event.clientX - bounds.left) / cellSize);
    const y = Math.floor((event.clientY - bounds.top) / cellSize);
    return x >= 0 && y >= 0 && x < width && y < height ? y * width + x : null;
  };

  const applyTo = (id: number) => {
    const current = drag.current;
    if (!current) return;
    if (current.kind === 'start') onMoveStart(id);
    else if (current.kind === 'goal') onMoveGoal(id);
    else onSetWall(id, current.blocked);
  };

  const handlePointerDown = (event: React.PointerEvent) => {
    const id = cellAt(event);
    if (id === null) return;
    canvasRef.current?.setPointerCapture(event.pointerId);

    if (id === start) drag.current = { kind: 'start' };
    else if (id === goal) drag.current = { kind: 'goal' };
    // The first cell decides the mode for the whole stroke: starting on a wall erases,
    // starting on open ground draws. Otherwise a drag would flicker cells on and off.
    else drag.current = { kind: 'paint', blocked: walls[id] === 0 };

    lastCell.current = id;
    applyTo(id);
  };

  const handlePointerMove = (event: React.PointerEvent) => {
    if (!drag.current || lastCell.current === null) return;
    const id = cellAt(event);
    if (id === null || id === lastCell.current) return;

    // A fast drag reports distant positions, so fill in the cells it skipped over.
    const fromX = lastCell.current % width;
    const fromY = Math.floor(lastCell.current / width);
    const toX = id % width;
    const toY = Math.floor(id / width);
    const steps = Math.max(Math.abs(toX - fromX), Math.abs(toY - fromY));
    for (let step = 1; step <= steps; step++) {
      const x = Math.round(fromX + ((toX - fromX) * step) / steps);
      const y = Math.round(fromY + ((toY - fromY) * step) / steps);
      applyTo(y * width + x);
    }

    lastCell.current = id;
  };

  const endDrag = () => {
    drag.current = null;
    lastCell.current = null;
  };

  return (
    <div ref={wrapperRef} className="gridcanvas">
      <canvas
        ref={canvasRef}
        role="img"
        aria-label={`Search grid, ${width} by ${height} cells. Drag to draw walls, or drag the start and goal markers to move them.`}
        className="gridcanvas__canvas"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      />
    </div>
  );
}
