/**
 * The open cell closest to a point, used to drop the start and goal markers somewhere
 * sensible on a freshly generated map instead of on top of a wall.
 */
export function nearestOpenCell(walls: Uint8Array, width: number, targetX: number, targetY: number): number {
  let best = -1;
  let bestDistance = Infinity;

  for (let id = 0; id < walls.length; id++) {
    if (walls[id] !== 0) continue;
    const dx = (id % width) - targetX;
    const dy = Math.floor(id / width) - targetY;
    const distance = dx * dx + dy * dy;
    if (distance < bestDistance) {
      bestDistance = distance;
      best = id;
    }
  }

  return best;
}
