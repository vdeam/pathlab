import { useEffect, useRef, useState } from 'react';
import { readGridTokens } from '../lib/colors.js';

export interface GridCanvasProps {
  /** Columns and rows of the grid. */
  readonly width: number;
  readonly height: number;
  /** One byte per cell, row-major. A non-zero byte is a blocked cell. */
  readonly walls: Uint8Array;
  readonly start: number;
  readonly goal: number;
}

/** Below this, the gridlines crowd the cells and are better left out. */
const MIN_CELL_FOR_GRIDLINES = 7;

export function GridCanvas({ width, height, walls, start, goal }: GridCanvasProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
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

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        context.fillStyle = walls[y * width + x] === 0 ? tokens.cell : tokens.wall;
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

      if (cellSize < 12) return;
      context.fillStyle = tokens.background;
      context.font = `600 ${Math.round(cellSize * 0.5)}px ${tokens.fontMono}`;
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.fillText(label, centerX, centerY + 0.5);
    };

    drawMarker(start, tokens.ink, 'S');
    drawMarker(goal, tokens.goal, 'G');
  }, [width, height, walls, start, goal, cellSize]);

  return (
    <div ref={wrapperRef} className="gridcanvas">
      <canvas
        ref={canvasRef}
        role="img"
        aria-label={`Search grid, ${width} by ${height} cells`}
        className="gridcanvas__canvas"
      />
    </div>
  );
}
