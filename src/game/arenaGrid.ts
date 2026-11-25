import { GRID_COLS, GRID_ROWS } from '../data/levels';
import { directionVectors } from '../utils/combat';

export interface ArenaTile {
  x: number;
  y: number;
}

export interface ReachableTile extends ArenaTile {
  steps: number;
  previous: ReachableTile | null;
}

const directions = Object.values(directionVectors);

export function reachableTiles(start: ArenaTile, blocked: (x: number, y: number) => boolean): ReachableTile[] {
  const x = Math.round(start.x);
  const y = Math.round(start.y);
  const queue: ReachableTile[] = [{ x, y, steps: 0, previous: null }];
  const visited = new Set([y * GRID_COLS + x]);

  for (let index = 0; index < queue.length; index++) {
    const tile = queue[index];
    for (const [dx, dy] of directions) {
      const nx = tile.x + dx;
      const ny = tile.y + dy;
      const key = ny * GRID_COLS + nx;
      if (nx <= 0 || nx >= GRID_COLS - 1 || ny <= 1 || ny >= GRID_ROWS - 1) continue;
      if (visited.has(key) || blocked(nx, ny)) continue;
      visited.add(key);
      queue.push({ x: nx, y: ny, steps: tile.steps + 1, previous: tile });
    }
  }
  return queue;
}

export function routeFrom(tile: ReachableTile): ArenaTile[] {
  const path: ArenaTile[] = [];
  for (let point: ReachableTile | null = tile; point; point = point.previous) {
    path.push({ x: point.x, y: point.y });
  }
  return path.reverse();
}
