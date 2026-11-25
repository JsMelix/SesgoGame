import { LabLevelConfig, PlayerProgress, KeyColor } from '../types/game';
import type { ActiveGlitchBot, FloorPickup } from '../components/pixelRenderer';
import { reachableTiles } from './arenaGrid';

export interface ArenaObjective {
  id: string;
  x: number;
  y: number;
  color: number;
  text: string;
}

interface RoomState {
  playerX: number;
  playerY: number;
  bots: ActiveGlitchBot[];
  keys: Record<KeyColor, number>;
  pickups: FloorPickup[];
  openedGates: Record<string, boolean>;
  openedChests: Record<string, boolean>;
  activatedSwitches: Record<string, boolean>;
}

const colors = { enemy: 0xfb7185, audit: 0x67e8f9, key: 0xfbbf24, exit: 0x34d399 };

export function chooseObjective(
  level: LabLevelConfig,
  progress: PlayerProgress,
  state: RoomState,
  blocked: (x: number, y: number) => boolean,
): ArenaObjective | null {
  const queue = reachableTiles({ x: state.playerX, y: state.playerY }, blocked);

  function pick(candidates: ArenaObjective[], radius: number) {
    let closest: ArenaObjective | null = null;
    let fewestSteps = Infinity;
    for (const candidate of candidates) {
      const point = queue.find(({ x, y }) => Math.hypot(x - candidate.x, y - candidate.y) <= radius);
      if (point && point.steps < fewestSteps) {
        closest = candidate;
        fewestSteps = point.steps;
      }
    }
    return closest;
  }

  const bots = state.bots.filter((bot) => !bot.destroyed);
  const pending = level.terminals.filter((terminal) => !progress.scenarios[terminal.scenarioId]?.solved);
  if (pending.length === 0 && bots.length === 0) {
    return { id: 'exit', x: level.exitX, y: level.exitY, color: colors.exit, text: 'Entra al portal y toma la decisión del capítulo.' };
  }

  const gates = level.gates.filter((gate) => !state.openedGates[gate.id]);
  const keyNeeded = (key?: KeyColor) => key && gates.some((gate) => gate.keyColor === key) && state.keys[key] === 0;
  const terminal = pick(pending
    .filter((node) => !bots.some((bot) => bot.linkedScenarioId === node.scenarioId))
    .map((node) => ({
      id: node.scenarioId,
      x: node.tileX,
      y: node.tileY,
      color: colors.audit,
      text: `Acércate a la terminal ${node.terminalNumber} para revisar el caso.`,
    })), 1.9);

  const guard = pick(bots.map((bot) => {
    const node = pending.find((item) => item.scenarioId === bot.linkedScenarioId);
    const text = bot.isBoss
      ? 'Derrota a VOX-ZERO. Esquiva la ráfaga o devuelve los disparos.'
      : node
        ? `Derriba al guardia para liberar la terminal ${node.terminalNumber}.`
        : 'Despeja la sala para abrir el portal.';
    return { id: bot.id, x: bot.x, y: bot.y, color: colors.enemy, text };
  }), 1.8);

  const route = pick([
    ...gates.filter((gate) => !gate.requiresSwitchId && gate.keyColor && state.keys[gate.keyColor] > 0).map((gate) => ({
      id: gate.id, x: gate.tileX + (gate.widthTiles - 1) / 2, y: gate.tileY + (gate.heightTiles - 1) / 2,
      color: colors.key, text: `Abre la compuerta con ${gate.keyLabel?.toLowerCase() ?? 'la llave'}.`,
    })),
    ...state.pickups.filter((item) => item.kind === 'key' && keyNeeded(item.keyColor)).map((item) => ({
      id: item.id, x: item.x, y: item.y, color: colors.key, text: `Recoge ${item.keyLabel?.toLowerCase() ?? 'la llave'}.`,
    })),
    ...level.chests.filter((chest) => !state.openedChests[chest.id] && keyNeeded(chest.keyColor)).map((chest) => ({
      id: chest.id, x: chest.tileX, y: chest.tileY, color: colors.key, text: `Abre el cofre para obtener ${chest.keyLabel?.toLowerCase() ?? 'la llave'}.`,
    })),
    ...level.switches.filter((item) => !state.activatedSwitches[item.id]).map((item) => ({
      id: item.id, x: item.tileX, y: item.tileY, color: colors.key, text: 'Dispara al interruptor sónico para abrir el paso.',
    })),
  ], 2.2);

  return terminal ?? guard ?? route;
}
