import { GRID_COLS, GRID_ROWS } from '../data/levels';
import { LabLevelConfig, WallBlock } from '../types/game';
import { gateIsOpen } from './fieldwork';

export interface GateState {
  openedGates: Record<string, boolean>;
  fieldApplied: boolean;
}

function inside(x: number, y: number, block: WallBlock, margin: number) {
  return x > block.tileX - margin && x < block.tileX + block.widthTiles - 1 + margin &&
    y > block.tileY - margin && y < block.tileY + block.heightTiles - 1 + margin;
}

export function blocksShot(level: LabLevelConfig, state: GateState, x: number, y: number) {
  if (x < 1.1 || x > GRID_COLS - 2.1 || y < 2 || y > GRID_ROWS - 2.1) return true;
  return level.walls.some((wall) => inside(x, y, wall, 0.65)) ||
    level.gates.some((gate) => !gateIsOpen(gate, state.openedGates, state.fieldApplied) && inside(x, y, gate, 0.65)) ||
    level.furniture.some((item) => item.kind === 'cover' && inside(x, y, item, 0.55));
}

export function blocksMovement(level: LabLevelConfig, state: GateState, x: number, y: number) {
  return blocksShot(level, state, x, y) ||
    level.furniture.some((item) => item.kind !== 'cover' && inside(x, y, item, 0.55)) ||
    level.chests.some((item) => Math.abs(x - item.tileX) < 0.65 && Math.abs(y - item.tileY) < 0.65) ||
    level.terminals.some((item) =>
      (Math.abs(x - item.tileX) < 0.72 && Math.abs(y - item.tileY) < 0.72) ||
      (Math.abs(x - item.npcTileX) < 0.65 && Math.abs(y - item.npcTileY) < 0.65));
}

export function clearDistance(level: LabLevelConfig, state: GateState, x: number, y: number, angle: number, distance: number) {
  const dx = Math.cos(angle);
  const dy = Math.sin(angle);
  for (let step = 0.25; step < distance; step += 0.25) {
    if (blocksShot(level, state, x + dx * step, y + dy * step)) return step;
  }
  return distance;
}
