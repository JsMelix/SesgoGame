import { canLeaveRoom, fieldRecord, fieldSites, gateIsOpen } from '../game/fieldwork';
import { clearDistance } from '../game/arenaGeometry';
import { circuitPhase } from '../game/hazards';
import type { ArenaTile } from '../game/arenaGrid';
import type { ArenaObjective } from '../game/objectives';
import { PARRY_RADIUS, SENTINEL_SHOT_SPEED } from '../utils/combat';
import { GRID_COLS, GRID_ROWS, TILE_SIZE } from '../data/levels';
import {
  ChestConfig,
  Direction,
  EnemyKind,
  FurnitureItem,
  GateConfig,
  KeyColor,
  LabLevelConfig,
  PlayerProgress,
  SwitchConfig,
  TerminalNode,
  WallBlock,
} from '../types/game';

export interface ActiveGlitchBot {
  id: string;
  kind: EnemyKind;
  isBoss: boolean;
  aimAngle: number;
  shotAngles: readonly number[];
  linkedScenarioId?: string;
  dropsKeyColor?: KeyColor;
  dropsKeyLabel?: string;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  hitFlash: number;
  windupTimer: number;
  recoveryTimer: number;
  dashTimer: number;
  dashVx: number;
  dashVy: number;
  shootCooldown: number;
  destroyed: boolean;
}

export interface Projectile {
  x: number;
  y: number;
  vx: number;
  vy: number;
  fromPlayer: boolean;
  damage?: number;
  isOverdrive?: boolean;
  isReflected?: boolean;
  life: number;
}

export interface FloorPickup {
  id: string;
  kind: 'heal' | 'key';
  keyColor?: KeyColor;
  keyLabel?: string;
  x: number;
  y: number;
  life: number;
}

export interface SparkParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

export interface ComicPopup {
  x: number;
  y: number;
  text: string;
  color: string;
  life: number;
}

export interface NearTargetInfo {
  type: 'terminal' | 'npc' | 'field' | 'exit' | 'chest' | 'gate' | 'switch';
  id: string;
  tileX: number;
  tileY: number;
  label: string;
  shielded?: boolean;
  lockedReason?: string;
}

export interface RenderState {
  level: LabLevelConfig;
  playerX: number;
  playerY: number;
  playerDir: Direction;
  walkPhase: number;
  isMoving: boolean;
  playerHitFlash: number;
  isDashing: boolean;
  parryRemaining: number;
  attackSwingTimer: number;
  overdriveTimer: number;
  pulseWave: { x: number; y: number; progress: number } | null;
  bots: ActiveGlitchBot[];
  openedChests: Record<string, boolean>;
  openedGates: Record<string, boolean>;
  activatedSwitches: Record<string, boolean>;
  projectiles: Projectile[];
  pickups: FloorPickup[];
  particles: SparkParticle[];
  popups: ComicPopup[];
  shakeOffset: { x: number; y: number };
  timeSec: number;
  roomTime: number;
  progress: PlayerProgress;
  nearestTarget: NearTargetInfo | null;
  objective: ArenaObjective | null;
  path: ArenaTile[];
}

function px(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string) {
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
}

function keyHex(color?: KeyColor): string {
  if (color === 'crimson') return '#EF4444';
  if (color === 'cyan') return '#38BDF8';
  return '#F59E0B';
}

function drawInteriorWalls(ctx: CanvasRenderingContext2D, walls: WallBlock[], level: LabLevelConfig) {
  for (const w of walls) {
    for (let dy = 0; dy < w.heightTiles; dy++) {
      for (let dx = 0; dx < w.widthTiles; dx++) {
        const x = (w.tileX + dx) * TILE_SIZE;
        const y = (w.tileY + dy) * TILE_SIZE;
        // Shadow
        px(ctx, x + 2, y + TILE_SIZE - 2, TILE_SIZE - 2, 4, 'rgba(0,0,0,0.45)');
        // Steel partition block
        px(ctx, x, y, TILE_SIZE, TILE_SIZE, '#05070B');
        px(ctx, x + 1, y + 1, TILE_SIZE - 2, TILE_SIZE - 2, level.wallColor);
        px(ctx, x + 2, y + 2, TILE_SIZE - 4, 4, '#52627B');
        px(ctx, x + 2, y + 6, TILE_SIZE - 4, 1, '#A9C4E3A0');
        px(ctx, x + 7, y + 8, TILE_SIZE - 14, 8, '#101827');
        for (let vent = 9; vent < 17; vent += 3) px(ctx, x + vent, y + 10, 1, 4, '#637893');
        if ((dx + dy) % 3 === 0) px(ctx, x + 16, y + 18, 3, 1, level.accentColor);
        px(ctx, x + 2, y + TILE_SIZE - 6, TILE_SIZE - 4, 4, level.wallTrimColor);
        // Rivets
        px(ctx, x + 4, y + 9, 2, 2, '#94A3B8');
        px(ctx, x + TILE_SIZE - 6, y + 9, 2, 2, '#94A3B8');
        // Hazard stripe accent on top strip
        px(ctx, x + 8, y + 3, 8, 2, level.accentColor);
      }
    }
  }
}

function drawGate(
  ctx: CanvasRenderingContext2D,
  gate: GateConfig,
  isOpen: boolean,
  timeSec: number
) {
  const x = gate.tileX * TILE_SIZE;
  const y = gate.tileY * TILE_SIZE;
  const w = gate.widthTiles * TILE_SIZE;
  const h = gate.heightTiles * TILE_SIZE;
  if (gate.requiresFieldTest) {
    const color = isOpen ? '#5EEAD4' : '#A78BFA';
    px(ctx, x, y, w, h, isOpen ? '#17353D' : '#1F1238');
    px(ctx, x, y + 2, 4, h - 4, '#5C5485');
    px(ctx, x + w - 4, y + 2, 4, h - 4, '#5C5485');
    px(ctx, x + 4, y + h - 4, w - 8, 2, color);
    for (let bar = 6; bar < w - 5; bar += 4) {
      if (!isOpen) px(ctx, x + bar, y + 3, 2, h - 8, color);
    }
    return;
  }


  if (isOpen) {
    // Open steel threshold track
    px(ctx, x + 2, y + 2, w - 4, h - 4, 'rgba(16,185,129,0.12)');
    px(ctx, x + 2, y + 2, 4, 4, '#10B981');
    px(ctx, x + w - 6, y + h - 6, 4, 4, '#10B981');
    return;
  }

  if (gate.requiresSwitchId) {
    // Pulsing Laser Barrier
    const flicker = Math.floor(timeSec * 12) % 2 === 0;
    px(ctx, x, y, w, h, 'rgba(239, 68, 68, 0.14)');
    if (gate.widthTiles > gate.heightTiles) {
      // Horizontal barrier
      px(ctx, x, y + 6, 5, 12, '#334155');
      px(ctx, x + w - 5, y + 6, 5, 12, '#334155');
      px(ctx, x + 4, y + 9, w - 8, 2, flicker ? '#EF4444' : '#F87171');
      px(ctx, x + 4, y + 13, w - 8, 2, flicker ? '#F59E0B' : '#EF4444');
    } else {
      // Vertical barrier
      px(ctx, x + 6, y, 12, 5, '#334155');
      px(ctx, x + 6, y + h - 5, 12, 5, '#334155');
      px(ctx, x + 9, y + 4, 2, h - 8, flicker ? '#EF4444' : '#F87171');
      px(ctx, x + 13, y + 4, 2, h - 8, flicker ? '#F59E0B' : '#EF4444');
    }
    return;
  }

  // Key-Locked Heavy Blast Door
  const color = keyHex(gate.keyColor);
  px(ctx, x, y, w, h, '#05070B');
  px(ctx, x + 2, y + 2, w - 4, h - 4, '#1E293B');
  // Steel bars
  if (gate.widthTiles > gate.heightTiles) {
    px(ctx, x + 4, y + 5, w - 8, 4, '#475569');
    px(ctx, x + 4, y + h - 9, w - 8, 4, '#475569');
  } else {
    px(ctx, x + 5, y + 4, 4, h - 8, '#475569');
    px(ctx, x + w - 9, y + 4, 4, h - 8, '#475569');
  }
  // Colored lock plate in center
  const cx = x + Math.floor(w / 2);
  const cy = y + Math.floor(h / 2);
  px(ctx, cx - 7, cy - 7, 14, 14, '#05070B');
  px(ctx, cx - 5, cy - 5, 10, 10, color);
  px(ctx, cx - 2, cy - 2, 4, 4, '#05070B');
  px(ctx, cx - 1, cy + 1, 2, 3, '#05070B');
}

function drawChest(
  ctx: CanvasRenderingContext2D,
  chest: ChestConfig,
  opened: boolean,
  isNearest: boolean,
  timeSec: number
) {
  const x = chest.tileX * TILE_SIZE;
  const y = chest.tileY * TILE_SIZE;
  const trim =
    chest.rewardType === 'key'
      ? keyHex(chest.keyColor)
      : chest.rewardType === 'overdrive'
      ? '#A855F7'
      : '#10B981';

  px(ctx, x + 2, y + 19, 20, 4, 'rgba(0,0,0,0.45)');
  px(ctx, x + 2, y + 4, 20, 17, isNearest && !opened ? '#FFFFFF' : '#05070B');

  if (opened) {
    // Open lid + dark interior
    px(ctx, x + 3, y + 3, 18, 6, '#334155');
    px(ctx, x + 4, y + 9, 16, 10, '#0F172A');
    px(ctx, x + 3, y + 17, 18, 3, '#475569');
  } else {
    // Closed reinforced metal chest
    px(ctx, x + 4, y + 6, 16, 13, '#475569');
    px(ctx, x + 4, y + 6, 16, 5, '#64748B');
    // Colored trim straps
    px(ctx, x + 5, y + 6, 3, 13, trim);
    px(ctx, x + 16, y + 6, 3, 13, trim);
    // Center lock clasp
    px(ctx, x + 9, y + 9, 6, 6, '#05070B');
    px(ctx, x + 10, y + 10, 4, 4, trim);
    // Twinkle sparkle
    if (Math.floor(timeSec * 4 + chest.tileX) % 3 === 0) {
      px(ctx, x + 18, y + 2, 3, 3, '#FEF08A');
    }
  }
}

function drawSwitch(
  ctx: CanvasRenderingContext2D,
  sw: SwitchConfig,
  active: boolean,
  timeSec: number
) {
  const x = sw.tileX * TILE_SIZE;
  const y = sw.tileY * TILE_SIZE;
  const pulse = Math.floor(timeSec * 5) % 2 === 0;
  px(ctx, x + 4, y + 4, 16, 16, '#05070B');
  px(ctx, x + 6, y + 6, 12, 12, '#334155');
  px(ctx, x + 8, y + 8, 8, 8, active ? '#10B981' : pulse ? '#EF4444' : '#F59E0B');
  px(ctx, x + 10, y + 10, 4, 4, '#FFFFFF');
}

function drawCircuitConduits(
  ctx: CanvasRenderingContext2D,
  level: LabLevelConfig,
  progress: PlayerProgress,
  bots: ActiveGlitchBot[]
) {
  const ex = level.exitX * TILE_SIZE + 12;
  const ey = level.exitY * TILE_SIZE + 12;

  for (const term of level.terminals) {
    const tx = term.tileX * TILE_SIZE + 12;
    const ty = term.tileY * TILE_SIZE + 12;
    const solved = Boolean(progress.scenarios[term.scenarioId]?.solved);
    const guardAlive = bots.some(
      (b) => b.linkedScenarioId === term.scenarioId && !b.destroyed
    );

    const conduitColor = solved ? '#10B981' : guardAlive ? 'rgba(127,29,29,0.55)' : '#F59E0B';
    ctx.strokeStyle = 'rgba(5,7,11,0.55)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(tx, ty);
    ctx.lineTo(ex, ty);
    ctx.lineTo(ex, ey);
    ctx.stroke();

    ctx.strokeStyle = conduitColor;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(tx, ty);
    ctx.lineTo(ex, ty);
    ctx.lineTo(ex, ey);
    ctx.stroke();
  }
}

function drawFurnitureItem(
  ctx: CanvasRenderingContext2D,
  item: FurnitureItem,
  timeSec: number,
  accentColor: string
) {
  const x = item.tileX * TILE_SIZE;
  const y = item.tileY * TILE_SIZE;
  const w = item.widthTiles * TILE_SIZE;
  const h = item.heightTiles * TILE_SIZE;

  if (item.kind === 'cover') {
    const top = ctx.createLinearGradient(0, y, 0, y + h);
    top.addColorStop(0, '#51647C');
    top.addColorStop(1, '#29334C');
    px(ctx, x - 2, y + 2, w + 4, h + 1, '#060913');
    ctx.fillStyle = top;
    ctx.fillRect(x, y + 1, w, h - 6);
    px(ctx, x + 2, y + 1, w - 4, 1, '#91A1C2');
    px(ctx, x + 2, y + h - 8, w - 4, 6, '#142036');
    px(ctx, x + 3, y + h - 8, w - 6, 1, accentColor + 'AA');
    for (let bar = 6; bar < w - 5; bar += 8) {
      px(ctx, x + bar, y + 5, 4, h - 16, '#192639');
      px(ctx, x + bar, y + 5, 1, h - 16, '#7D90AA');
    }
    px(ctx, x + 3, y + h - 5, 4, 2, '#D8C897');
    px(ctx, x + w - 7, y + h - 5, 4, 2, '#D8C897');
    return;
  }

  if (item.kind === 'amp') {
    px(ctx, x + 2, y - 4, w - 4, 28, '#05070B');
    px(ctx, x + 4, y - 2, w - 8, 24, '#1E293B');
    px(ctx, x + 5, y, w - 10, 4, '#F59E0B');
    px(ctx, x + 8, y + 1, 3, 2, '#05070B');
    px(ctx, x + w - 12, y + 1, 3, 2, '#EF4444');
    const thump = Math.floor(timeSec * 6) % 2;
    for (let sx = 6; sx < w - 12; sx += 18) {
      px(ctx, x + sx, y + 6, 14, 14, '#05070B');
      px(ctx, x + sx + 2, y + 8, 10, 10, '#334155');
      px(ctx, x + sx + 4 - thump, y + 10 - thump, 6 + thump * 2, 6 + thump * 2, '#0F172A');
      px(ctx, x + sx + 6, y + 12, 2, 2, '#94A3B8');
    }
    return;
  }

  if (item.kind === 'tesla') {
    px(ctx, x + 4, y + 17, 16, 6, '#1E293B');
    px(ctx, x + 8, y + 6, 8, 12, '#475569');
    px(ctx, x + 6, y + 9, 12, 2, '#F59E0B');
    px(ctx, x + 6, y + 13, 12, 2, '#F59E0B');
    px(ctx, x + 6, y - 2, 12, 8, '#CBD5E1');
    px(ctx, x + 8, y, 4, 3, '#FFFFFF');
    if (Math.floor(timeSec * 8 + x) % 3 === 0) {
      px(ctx, x + 1, y - 2, 5, 2, '#38BDF8');
      px(ctx, x + 18, y - 1, 5, 2, '#F59E0B');
    }
    return;
  }

  if (item.kind === 'poster') {
    px(ctx, x + 3, y + 3, w - 6, 24, '#05070B');
    px(ctx, x + 5, y + 5, w - 10, 20, '#7F1D1D');
    const mid = x + Math.floor(w / 2);
    px(ctx, mid - 7, y + 8, 14, 8, '#E2E8F0');
    px(ctx, mid - 4, y + 11, 3, 3, '#05070B');
    px(ctx, mid + 2, y + 11, 3, 3, '#05070B');
    px(ctx, mid - 5, y + 17, 10, 4, '#CBD5E1');
    px(ctx, mid - 18, y + 9, 4, 9, '#F59E0B');
    px(ctx, mid + 14, y + 9, 4, 9, '#F59E0B');
    return;
  }

  if (item.kind === 'whiteboard') {
    px(ctx, x + 3, y + 3, w - 6, 24, '#05070B');
    px(ctx, x + 6, y + 6, w - 12, 18, '#0F172A');
    px(ctx, x + 12, y + 16, 6, 5, '#38BDF8');
    px(ctx, x + 21, y + 10, 6, 11, '#10B981');
    px(ctx, x + 30, y + 13, 6, 8, '#F59E0B');
    px(ctx, x + 42, y + 9, w - 54, 3, '#475569');
    px(ctx, x + 42, y + 15, w - 62, 3, accentColor);
    return;
  }

  if (item.kind === 'rack') {
    px(ctx, x + 3, y + 2, w - 6, 26, '#05070B');
    px(ctx, x + 6, y + 5, w - 12, 20, '#1E293B');
    for (let row = 0; row < 3; row++) {
      const ry = y + 7 + row * 6;
      px(ctx, x + 9, ry, w - 18, 3, '#0F172A');
      const blink = Math.floor(timeSec * 4 + row) % 2 === 0;
      px(ctx, x + 11, ry, 3, 3, blink ? '#EF4444' : '#7F1D1D');
      px(ctx, x + 17, ry, 3, 3, blink ? '#F59E0B' : accentColor);
    }
    return;
  }

  if (item.kind === 'desk' || item.kind === 'table') {
    px(ctx, x + 3, y + h - 2, w - 6, 4, 'rgba(0,0,0,0.45)');
    px(ctx, x + 1, y + 1, w - 2, h - 4, '#05070B');
    px(ctx, x + 3, y + 3, w - 6, h - 8, '#475569');
    px(ctx, x + 1, y + h - 6, w - 2, 4, '#1E293B');
    px(ctx, x + 5, y + 5, 2, 2, '#94A3B8');
    px(ctx, x + w - 7, y + 5, 2, 2, '#94A3B8');
    if (item.kind === 'table') {
      px(ctx, x + 10, y + 10, 12, 9, '#E2E8F0');
      px(ctx, x + 12, y + 13, 8, 2, '#1E293B');
      px(ctx, x + w - 22, y + 11, 10, 10, '#F59E0B');
    }
  }
}

function drawTerminal(
  ctx: CanvasRenderingContext2D,
  node: TerminalNode,
  solved: boolean,
  shielded: boolean,
  isNearest: boolean,
  timeSec: number
) {
  const x = node.tileX * TILE_SIZE;
  const y = node.tileY * TILE_SIZE;

  px(ctx, x + 2, y + 20, 20, 4, 'rgba(0,0,0,0.5)');
  px(ctx, x + 5, y + 15, 14, 7, '#334155');
  px(ctx, x + 8, y + 13, 8, 3, '#64748B');

  px(ctx, x + 2, y + 2, 20, 14, isNearest && !shielded ? '#38BDF8' : '#05070B');
  px(ctx, x + 4, y + 4, 16, 10, '#1E293B');

  const pulse = Math.floor(timeSec * 3) % 2 === 0;
  const screenBg = solved ? '#10B981' : shielded ? '#DC2626' : pulse ? '#F59E0B' : '#D97706';
  px(ctx, x + 5, y + 5, 14, 8, screenBg);
  const waveH = solved ? 3 : 2 + (Math.floor(timeSec * 8 + node.terminalNumber) % 4);
  px(ctx, x + 7, y + 7, 2, waveH, '#05070B');
  px(ctx, x + 11, y + 6, 2, 4, '#05070B');
  px(ctx, x + 15, y + 7, 2, waveH, '#05070B');

  if (shielded && !solved) {
    ctx.strokeStyle = pulse ? '#EF4444' : '#F87171';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, TILE_SIZE, TILE_SIZE);
    ctx.fillStyle = 'rgba(239, 68, 68, 0.16)';
    ctx.fillRect(x + 1, y + 1, TILE_SIZE - 2, TILE_SIZE - 2);
  }

  const bob = Math.round(Math.sin(timeSec * 4 + node.terminalNumber) * 2);
  const badgeY = y - 14 + bob;
  px(ctx, x - 5, badgeY, 12, 12, '#05070B');
  ctx.fillStyle = '#E0F2FE';
  ctx.font = 'bold 8px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(String(node.terminalNumber), x + 1, badgeY + 6);
  px(ctx, x + 5, badgeY, 14, 12, '#05070B');
  px(
    ctx,
    x + 6,
    badgeY + 1,
    12,
    10,
    solved ? '#064E3B' : shielded ? '#7F1D1D' : '#78350F'
  );
  if (solved) {
    px(ctx, x + 8, badgeY + 5, 2, 3, '#34D399');
    px(ctx, x + 10, badgeY + 7, 2, 2, '#34D399');
    px(ctx, x + 12, badgeY + 4, 3, 3, '#34D399');
  } else if (shielded) {
    px(ctx, x + 9, badgeY + 3, 6, 3, '#FCA5A5');
    px(ctx, x + 8, badgeY + 5, 8, 5, '#EF4444');
  } else {
    px(ctx, x + 11, badgeY + 3, 2, 4, '#FBBF24');
    px(ctx, x + 11, badgeY + 8, 2, 2, '#FBBF24');
  }
}

function drawHeroKael(
  ctx: CanvasRenderingContext2D,
  tileX: number,
  tileY: number,
  dir: Direction,
  walkPhase: number,
  hitFlash: number,
  attackSwingTimer: number,
  overdriveTimer: number,
  timeSec: number
) {
  const x = Math.round(tileX * TILE_SIZE);
  const y = Math.round(tileY * TILE_SIZE);
  const step = Math.sin(walkPhase) > 0.25 ? 2 : Math.sin(walkPhase) < -0.25 ? -2 : 0;

  if (overdriveTimer > 0) {
    ctx.strokeStyle = Math.floor(timeSec * 14) % 2 === 0 ? '#A855F7' : '#F59E0B';
    ctx.lineWidth = 2;
    ctx.strokeRect(x + 1, y - 3, 22, 26);
  }

  px(ctx, x + 4, y + 20, 16, 4, 'rgba(0,0,0,0.45)');

  if (hitFlash > 0 && Math.floor(hitFlash * 20) % 2 === 0) {
    px(ctx, x + 4, y - 3, 16, 25, '#FFFFFF');
    return;
  }

  if (attackSwingTimer > 0) {
    const gx = dir === 'left' ? x - 10 : x + 16;
    const gy = y + 6;
    px(ctx, gx, gy, 10, 5, overdriveTimer > 0 ? '#A855F7' : '#EF4444');
    px(ctx, gx + 2, gy + 1, 6, 3, '#F59E0B');
    px(ctx, dir === 'left' ? gx - 5 : gx + 10, gy + 1, 6, 2, '#E2E8F0');
  } else {
    px(ctx, x + 17, y - 2, 3, 10, '#78350F');
    px(ctx, x + 16, y - 4, 4, 3, overdriveTimer > 0 ? '#A855F7' : '#F59E0B');
  }

  px(ctx, x + 6, y + 17 + (step > 0 ? -1 : 0), 5, 5, '#05070B');
  px(ctx, x + 13, y + 17 + (step < 0 ? -1 : 0), 5, 5, '#05070B');
  px(ctx, x + 7, y + 20 + (step > 0 ? -1 : 0), 3, 1, '#64748B');
  px(ctx, x + 14, y + 20 + (step < 0 ? -1 : 0), 3, 1, '#64748B');

  px(ctx, x + 6, y + 14, 5, 4, '#1E293B');
  px(ctx, x + 13, y + 14, 5, 4, '#1E293B');

  px(ctx, x + 4, y + 7, 16, 8, '#05070B');
  px(ctx, x + 5, y + 8, 14, 6, '#354361');
  px(ctx, x + 5, y + 9, 3, 5, '#20314C');
  px(ctx, x + 16, y + 9, 3, 5, '#20314C');
  px(ctx, x + 9, y + 8, 6, 6, '#111827');
  px(ctx, x + 10, y + 9, 4, 3, '#EF4444');
  px(ctx, x + 10, y + 9, 2, 2, '#FFD78B');
  px(ctx, x + 8, y + 12, 8, 1, '#849ABC');
  px(ctx, x + 8, y + 13, 2, 1, '#E2E8F0');
  px(ctx, x + 5, y + 8, 2, 1, '#E2E8F0');
  px(ctx, x + 17, y + 8, 2, 1, '#E2E8F0');
  px(ctx, x + 6, y + 6, 3, 3, '#334155');
  px(ctx, x + 15, y + 6, 3, 3, '#334155');
  px(ctx, x + 6, y + 7, 1, 2, '#F59E0B');
  px(ctx, x + 17, y + 7, 1, 2, '#F59E0B');

  px(ctx, x + 6, y - 2, 12, 9, '#05070B');
  px(ctx, x + 7, y - 1, 10, 8, '#FDBA74');

  px(ctx, x + 5, y - 5, 14, 5, '#0F172A');
  px(ctx, x + 6, y - 7, 3, 3, '#0F172A');
  px(ctx, x + 11, y - 8, 3, 4, '#1E293B');
  px(ctx, x + 15, y - 6, 3, 3, '#0F172A');
  px(ctx, x + 8, y - 4, 2, 1, '#526583');
  px(ctx, x + 12, y - 6, 2, 1, '#526583');
  px(ctx, x + 6, y, 12, 1, '#BB5650');

  if (dir === 'up') {
    px(ctx, x + 7, y - 1, 10, 7, '#0F172A');
  } else {
    const eyeShift = dir === 'left' ? -1 : dir === 'right' ? 1 : 0;
    px(ctx, x + 8 + eyeShift, y + 2, 2, 3, '#05070B');
    px(ctx, x + 14 + eyeShift, y + 2, 2, 3, '#05070B');
    px(ctx, x + 8 + eyeShift, y + 2, 1, 1, '#FFFFFF');
    px(ctx, x + 14 + eyeShift, y + 2, 1, 1, '#FFFFFF');
  }
}

function drawNpc(ctx: CanvasRenderingContext2D, node: TerminalNode, timeSec: number) {
  const x = Math.round(node.npcTileX * TILE_SIZE);
  const bob = Math.round(Math.sin(timeSec * 2.5 + node.terminalNumber) * 1);
  const y = Math.round(node.npcTileY * TILE_SIZE + bob);

  px(ctx, x + 5, y + 20 - bob, 14, 4, 'rgba(0,0,0,0.4)');
  px(ctx, x + 7, y + 16, 4, 5, '#0F172A');
  px(ctx, x + 13, y + 16, 4, 5, '#0F172A');

  px(ctx, x + 5, y + 7, 14, 9, '#05070B');
  px(
    ctx,
    x + 6,
    y + 8,
    12,
    7,
    node.npcStyle === 'labcoat' ? '#E2E8F0' : node.npcShirtColor
  );
  if (node.npcStyle === 'labcoat') {
    px(ctx, x + 10, y + 8, 4, 7, node.npcShirtColor);
  }

  px(ctx, x + 6, y - 2, 12, 9, '#05070B');
  px(ctx, x + 7, y - 1, 10, 8, node.npcSkinColor);

  if (node.npcStyle === 'beanie') {
    px(ctx, x + 6, y - 5, 12, 5, '#F59E0B');
    px(ctx, x + 8, y - 6, 8, 2, '#D97706');
  } else {
    px(ctx, x + 6, y - 4, 12, 4, node.npcHairColor);
    if (node.npcStyle === 'ponytail') {
      px(ctx, x + 17, y - 2, 3, 6, node.npcHairColor);
    }
  }

  px(ctx, x + 8, y + 2, 2, 2, '#05070B');
  px(ctx, x + 14, y + 2, 2, 2, '#05070B');
  if (node.npcStyle === 'glasses') {
    px(ctx, x + 7, y + 1, 4, 4, 'rgba(56,189,248,0.45)');
    px(ctx, x + 13, y + 1, 4, 4, 'rgba(56,189,248,0.45)');
    px(ctx, x + 11, y + 2, 2, 1, '#334155');
  }
}

function drawLumenCompanion(ctx: CanvasRenderingContext2D, playerX: number, playerY: number, timeSec: number) {
  const lx = Math.round((playerX - 0.95) * TILE_SIZE + Math.cos(timeSec * 2.2) * 3);
  const ly = Math.round((playerY - 0.8) * TILE_SIZE + Math.sin(timeSec * 4) * 3);
  const wingFlap = Math.floor(timeSec * 8) % 2 === 0 ? -2 : 1;

  px(ctx, lx + 4, ly + 17, 8, 3, 'rgba(245,158,11,0.25)');
  px(ctx, lx - 2, ly + 5 + wingFlap, 4, 5, '#64748B');
  px(ctx, lx + 14, ly + 5 + wingFlap, 4, 5, '#64748B');
  px(ctx, lx + 1, ly + 1, 14, 13, '#05070B');
  px(ctx, lx + 2, ly + 2, 12, 11, '#94A3B8');
  px(ctx, lx + 3, ly + 3, 10, 4, '#E2E8F0');
  px(ctx, lx + 2, ly - 2, 3, 4, '#F59E0B');
  px(ctx, lx + 11, ly - 2, 3, 4, '#F59E0B');
  px(ctx, lx + 3, ly + 5, 10, 5, '#05070B');
  px(ctx, lx + 4, ly + 6, 3, 3, '#F59E0B');
  px(ctx, lx + 9, ly + 6, 3, 3, '#F59E0B');
}

function drawAttackWarning(ctx: CanvasRenderingContext2D, bot: ActiveGlitchBot, state: RenderState) {
  if (bot.destroyed || bot.windupTimer <= 0) return;
  const x = bot.x * TILE_SIZE + 12;
  const y = bot.y * TILE_SIZE + 12;
  const isCharge = bot.kind === 'echo_bot';
  const angle = bot.aimAngle;
  const distance = isCharge ? 3.1 : SENTINEL_SHOT_SPEED * 1.85;
  const gates = { openedGates: state.openedGates, fieldApplied: fieldRecord(state.progress, state.level.id).applied };
  ctx.save();
  ctx.strokeStyle = isCharge ? '#FBBF24' : '#FB7185';
  ctx.lineWidth = isCharge ? 3 : 1.5;
  ctx.setLineDash([6, 5]);
  for (const offset of isCharge ? [0] : bot.shotAngles) {
    ctx.beginPath();
    ctx.moveTo(x, y);
    const direction = angle + offset;
    const length = clearDistance(state.level, gates, bot.x, bot.y, direction, distance) * TILE_SIZE;
    ctx.lineTo(x + Math.cos(direction) * length, y + Math.sin(direction) * length);
    ctx.stroke();
  }
  ctx.restore();
}

function drawEnemyBot(ctx: CanvasRenderingContext2D, bot: ActiveGlitchBot, timeSec: number) {
  if (bot.destroyed) return;
  const bx = Math.round(bot.x * TILE_SIZE);
  const by = Math.round(bot.y * TILE_SIZE + Math.sin(timeSec * 5 + bot.x) * 2);

  px(ctx, bx + 4, by + 20, 16, 3, 'rgba(0,0,0,0.45)');
  if (bot.recoveryTimer > 0) {
    ctx.strokeStyle = '#67E8F9';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(bx - 1, by - 3, 26, 25);
  }

  if (bot.hitFlash > 0 && Math.floor(bot.hitFlash * 25) % 2 === 0) {
    px(ctx, bx + 2, by + 1, 20, 18, '#FFFFFF');
    return;
  }

  if (bot.isBoss) {
    const glow = bot.hp <= bot.maxHp / 2 ? '#FBBF24' : '#FB7185';
    px(ctx, bx - 7, by + 3, 38, 16, '#070B16');
    px(ctx, bx - 4, by + 6, 32, 10, '#51415E');
    px(ctx, bx + 2, by - 5, 20, 26, '#110C22');
    px(ctx, bx + 5, by - 3, 14, 22, '#75264A');
    px(ctx, bx + 7, by + 4, 10, 8, glow);
    px(ctx, bx + 10, by + 6, 4, 4, '#FFF1DB');
    px(ctx, bx - 3, by + 8, 4, 5, glow);
    px(ctx, bx + 23, by + 8, 4, 5, glow);
    return;
  }

  if (bot.kind === 'noise_drone') {
    px(ctx, bx + 3, by + 2, 18, 15, '#05070B');
    px(ctx, bx + 5, by + 4, 14, 11, '#991B1B');
    px(ctx, bx + 4, by - 1, 3, 4, '#EF4444');
    px(ctx, bx + 17, by - 1, 3, 4, '#EF4444');
    px(ctx, bx + 7, by + 7, 3, 3, '#FBBF24');
    px(ctx, bx + 14, by + 7, 3, 3, '#FBBF24');
    px(ctx, bx + 8, by + 12, 8, 2, '#E2E8F0');
  } else if (bot.kind === 'echo_bot') {
    px(ctx, bx + 1, by + 1, 22, 18, '#05070B');
    px(ctx, bx + 3, by + 3, 18, 14, '#7F1D1D');
    px(ctx, bx + 4, by + 4, 16, 4, '#475569');
    const visorColor = bot.windupTimer > 0 ? '#FEF08A' : '#EF4444';
    px(ctx, bx + 5, by + 9, 14, 4, '#05070B');
    px(ctx, bx + 6, by + 10, 12, 2, visorColor);
    if (bot.windupTimer > 0) {
      px(ctx, bx + 10, by - 8, 4, 5, '#F59E0B');
      px(ctx, bx + 10, by - 2, 4, 2, '#F59E0B');
    }
  } else {
    px(ctx, bx, by, 24, 20, '#05070B');
    px(ctx, bx + 2, by + 2, 20, 16, '#450A0A');
    px(ctx, bx + 4, by + 4, 16, 12, '#991B1B');
    px(ctx, bx + 1, by - 5, 4, 6, '#94A3B8');
    px(ctx, bx + 19, by - 5, 4, 6, '#94A3B8');
    px(ctx, bx + 6, by + 7, 4, 4, '#F59E0B');
    px(ctx, bx + 14, by + 7, 4, 4, '#F59E0B');
    px(ctx, bx + 7, by + 13, 10, 2, '#FCA5A5');
  }

  if (bot.kind === 'vox_sentinel' && bot.windupTimer > 0) {
    px(ctx, bx + 10, by + 7, 4, 4, '#FECACA');
  }

  // Key carrier indicator dot above HP bar
  if (bot.dropsKeyColor) {
    px(ctx, bx + 9, by - 12, 6, 4, keyHex(bot.dropsKeyColor));
  }

  const barW = 18;
  const barX = bx + 3;
  const barY = by - 6;
  px(ctx, barX - 1, barY - 1, barW + 2, 4, '#05070B');
  px(ctx, barX, barY, barW, 2, '#334155');
  const fillW = Math.max(2, Math.round((bot.hp / bot.maxHp) * barW));
  px(ctx, barX, barY, fillW, 2, '#EF4444');
}

function drawExitPortal(
  ctx: CanvasRenderingContext2D,
  level: LabLevelConfig,
  unlocked: boolean,
  timeSec: number
) {
  const x = level.exitX * TILE_SIZE;
  const y = level.exitY * TILE_SIZE;
  const pulse = Math.floor(timeSec * 5) % 2 === 0;

  px(ctx, x - 2, y - 2, TILE_SIZE + 4, TILE_SIZE + 4, '#05070B');
  px(ctx, x, y, TILE_SIZE, TILE_SIZE, unlocked ? (pulse ? '#10B981' : '#059669') : '#334155');
  px(ctx, x + 3, y + 3, TILE_SIZE - 6, TILE_SIZE - 6, unlocked ? '#064E3B' : '#1E293B');

  if (unlocked) {
    px(ctx, x + 7, y + 10, 9, 4, '#34D399');
    px(ctx, x + 13, y + 7, 3, 10, '#34D399');
    px(ctx, x + 16, y + 10, 2, 4, '#A7F3D0');
  } else {
    px(ctx, x + 9, y + 6, 6, 4, '#64748B');
    px(ctx, x + 10, y + 7, 4, 3, '#0F172A');
    px(ctx, x + 8, y + 10, 8, 7, '#64748B');
  }
}

function drawInteractionBubble(
  ctx: CanvasRenderingContext2D,
  tileX: number,
  tileY: number,
  label: string,
  bgColor = '#F59E0B'
) {
  const cx = Math.round(tileX * TILE_SIZE + 12);
  const cy = Math.round(tileY * TILE_SIZE - 22);
  const boxW = Math.max(28, label.length * 6 + 10);
  const bx = cx - Math.floor(boxW / 2);

  px(ctx, bx, cy, boxW, 14, '#05070B');
  px(ctx, bx + 2, cy + 2, boxW - 4, 10, bgColor);

  ctx.fillStyle = '#05070B';
  ctx.font = 'bold 8px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, cx, cy + 7);
}

function drawFieldFixtures(ctx: CanvasRenderingContext2D, state: RenderState) {
  const { level, progress } = state;
  const record = fieldRecord(progress, level.id);
  for (const site of fieldSites(level.id)) {
    const isConsole = site.id === 'console';
    const done = isConsole ? record.applied : record.sources.includes(site.id);
    const color = done ? '#5EEAD4' : '#C4B5FD';
    const x = site.x * TILE_SIZE;
    const y = site.y * TILE_SIZE;
    const width = isConsole ? 29 : 20;
    const left = x + (24 - width) / 2;

    // Mount the station over a recessed service bay.
    ctx.fillStyle = '#080718DD';
    ctx.beginPath();
    ctx.ellipse(x + 12, y + 19, width / 2 + 7, 9, 0, 0, Math.PI * 2);
    ctx.fill();
    px(ctx, left - 2, y + 8, width + 4, 10, '#17132C');
    px(ctx, left, y + 3, width, 13, '#383051');
    px(ctx, left + 2, y + 3, width - 4, 3, '#685482');
    px(ctx, left + 2, y + 7, width - 4, 6, '#110F29');
    if (isConsole) {
      for (let cell = 0; cell < 5; cell++) px(ctx, left + 4 + cell * 4, y + 8 + cell % 2, 2, 4 - cell % 2, color);
    } else {
      px(ctx, left + 4, y + 8, width - 8, 1, color);
      const detail = site.id === 'A' ? 6 : 9;
      px(ctx, left + 4, y + 11, detail, 1, color);
    }
    px(ctx, left + 1, y + 16, width - 2, 2, color);
    for (let step = 4; step < width - 3; step += 5) {
      px(ctx, left + step, y + 21, 2, 1, color);
    }

    px(ctx, x + 5, y - 9, 14, 11, '#080718');
    ctx.fillStyle = color;
    ctx.font = 'bold 9px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(isConsole ? '∆' : site.id, x + 12, y - 3);
  }
}

function drawRoomMap(
  ctx: CanvasRenderingContext2D,
  state: RenderState,
  exitUnlocked: boolean,
  camX: number,
  camY: number,
) {
  const { level } = state;
  const cell = ctx.canvas.width < 400 ? 2 : 3;
  const width = GRID_COLS * cell;
  const height = GRID_ROWS * cell;
  const x = ctx.canvas.width - width - 10;
  const y = 46;
  px(ctx, x - 4, y - 4, width + 8, height + 8, '#080D19E8');
  px(ctx, x, y, width, height, '#192538');
  for (const wall of level.walls) {
    px(ctx, x + wall.tileX * cell, y + wall.tileY * cell, wall.widthTiles * cell, wall.heightTiles * cell, '#54647B');
  }
  for (const item of level.furniture) {
    if (item.kind === 'cover') px(ctx, x + item.tileX * cell, y + item.tileY * cell, item.widthTiles * cell, item.heightTiles * cell, '#7185A0');
  }
  for (const gate of level.gates) {
    if (!gateIsOpen(gate, state.openedGates, fieldRecord(state.progress, level.id).applied)) {
      px(ctx, x + gate.tileX * cell, y + gate.tileY * cell, gate.widthTiles * cell, gate.heightTiles * cell, '#D49854');
    }
  }
  for (const terminal of level.terminals) {
    const solved = state.progress.scenarios[terminal.scenarioId]?.solved;
    const shielded = state.bots.some((bot) => !bot.destroyed && bot.linkedScenarioId === terminal.scenarioId);
    px(ctx, x + terminal.tileX * cell - 1, y + terminal.tileY * cell - 1, cell + 2, cell + 2,
      shielded ? '#FB7185' : solved ? '#34D399' : '#67E8F9');
  }
  const record = fieldRecord(state.progress, level.id);
  for (const site of fieldSites(level.id)) {
    const done = site.id === 'console' ? record.applied : record.sources.includes(site.id);
    px(ctx, x + site.x * cell, y + site.y * cell, cell + 1, cell + 1, done ? '#5EEAD4' : '#C4B5FD');
  }
  const scale = cell / TILE_SIZE;
  ctx.strokeStyle = '#9BAAC585';
  ctx.lineWidth = 1;
  ctx.strokeRect(x + camX * scale, y + camY * scale, ctx.canvas.width * scale, ctx.canvas.height * scale);
  px(ctx, x + level.exitX * cell, y + level.exitY * cell, cell + 1, cell + 1, exitUnlocked ? '#FDE047' : '#94A3B8');
  if (state.objective) {
    const ox = x + state.objective.x * cell;
    const oy = y + state.objective.y * cell;
    ctx.strokeStyle = '#FFFFFF';
    ctx.strokeRect(ox - 2, oy - 2, cell + 4, cell + 4);
  }
  px(ctx, x + state.playerX * cell, y + state.playerY * cell, cell + 1, cell + 1, '#FFFFFF');
}

export function renderLabScene(
  ctx: CanvasRenderingContext2D,
  state: RenderState,
  camX: number,
  camY: number
) {
  const { level, timeSec, progress } = state;

  ctx.imageSmoothingEnabled = false;
  ctx.save();
  ctx.translate(
    Math.round(-camX + state.shakeOffset.x),
    Math.round(-camY + state.shakeOffset.y)
  );

  for (const circuit of level.circuits ?? []) {
    const phase = circuitPhase(state.roomTime, circuit.offset);
    const color = phase === 'live' ? '#FB7185' : phase === 'warning' ? '#FBBF24' : '#477380';
    const x = circuit.tileX * TILE_SIZE;
    const y = circuit.tileY * TILE_SIZE;
    const width = circuit.widthTiles * TILE_SIZE;
    px(ctx, x, y + 1, width, TILE_SIZE - 2, phase === 'live' ? '#831124' : '#081722');
    px(ctx, x, y + 1, width, 2, color);
    px(ctx, x, y + TILE_SIZE - 3, width, 2, color);
    for (let stripe = 4; stripe < width - 4; stripe += 8) {
      px(ctx, x + stripe, y + 8, 4, 8, color);
    }
  }

  drawCircuitConduits(ctx, level, progress, state.bots);
  for (const [index, point] of state.path.entries()) {
    const x = point.x * TILE_SIZE + 12;
    const y = point.y * TILE_SIZE + 12;
    const color = index === state.path.length - 1 ? '#A5F3FC' : '#67E8F9A0';
    px(ctx, x - 2, y - 1, 4, 2, color);
    px(ctx, x - 1, y - 2, 2, 4, color);
  }
  drawInteriorWalls(ctx, level.walls, level);

  for (const gate of level.gates) {
    drawGate(ctx, gate, gateIsOpen(gate, state.openedGates, fieldRecord(progress, level.id).applied), timeSec);
  }

  for (const sw of level.switches) {
    drawSwitch(ctx, sw, Boolean(state.activatedSwitches[sw.id]), timeSec);
  }

  const exitUnlocked = canLeaveRoom(level, progress, state.bots.filter((bot) => !bot.destroyed).length);

  drawExitPortal(ctx, level, exitUnlocked, timeSec);
  drawFieldFixtures(ctx, state);

  for (const item of level.furniture) {
    drawFurnitureItem(ctx, item, timeSec, level.accentColor);
  }

  for (const chest of level.chests) {
    const isNear = state.nearestTarget?.type === 'chest' && state.nearestTarget.id === chest.id;
    drawChest(ctx, chest, Boolean(state.openedChests[chest.id]), isNear, timeSec);
  }

  if (state.pulseWave) {
    const r = state.pulseWave.progress * 2.4 * TILE_SIZE;
    ctx.strokeStyle =
      state.overdriveTimer > 0
        ? '#A855F7'
        : state.pulseWave.progress < 0.5
        ? '#F59E0B'
        : '#38BDF8';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(
      Math.round(state.pulseWave.x * TILE_SIZE + 12),
      Math.round(state.pulseWave.y * TILE_SIZE + 12),
      Math.round(r),
      0,
      Math.PI * 2
    );
    ctx.stroke();
  }

  // Pickups (Health + Dropped Keys)
  for (const pk of state.pickups) {
    const pxX = Math.round(pk.x * TILE_SIZE + 6);
    const pxY = Math.round(pk.y * TILE_SIZE + 6 + Math.sin(timeSec * 6) * 2);
    if (pk.kind === 'key') {
      const kc = keyHex(pk.keyColor);
      px(ctx, pxX - 2, pxY - 2, 16, 14, '#05070B');
      px(ctx, pxX, pxY, 6, 6, kc);
      px(ctx, pxX + 2, pxY + 2, 2, 2, '#05070B');
      px(ctx, pxX + 6, pxY + 2, 6, 2, kc);
      px(ctx, pxX + 9, pxY + 4, 2, 3, kc);
    } else {
      px(ctx, pxX, pxY, 12, 12, '#05070B');
      px(ctx, pxX + 2, pxY + 2, 8, 8, '#10B981');
      px(ctx, pxX + 5, pxY + 3, 2, 6, '#FFFFFF');
      px(ctx, pxX + 3, pxY + 5, 6, 2, '#FFFFFF');
    }
  }

  for (const term of level.terminals) {
    const solved = Boolean(progress.scenarios[term.scenarioId]?.solved);
    const shielded = state.bots.some((b) => b.linkedScenarioId === term.scenarioId && !b.destroyed);
    const isNearest =
      state.nearestTarget?.type === 'terminal' && state.nearestTarget.id === term.scenarioId;
    drawTerminal(ctx, term, solved, shielded, isNearest, timeSec);
  }

  const entities: Array<{ y: number; draw: () => void }> = [];

  for (const term of level.terminals) {
    entities.push({
      y: term.npcTileY,
      draw: () => drawNpc(ctx, term, timeSec),
    });
  }

  for (const bot of state.bots) {
    if (!bot.destroyed) {
      entities.push({
        y: bot.y,
        draw: () => drawEnemyBot(ctx, bot, timeSec),
      });
    }
  }

  entities.push({
    y: state.playerY,
    draw: () =>
      drawHeroKael(
        ctx,
        state.playerX,
        state.playerY,
        state.playerDir,
        state.isMoving ? state.walkPhase : 0,
        state.playerHitFlash,
        state.attackSwingTimer,
        state.overdriveTimer,
        timeSec
      ),
  });

  for (const bot of state.bots) drawAttackWarning(ctx, bot, state);

  entities.sort((a, b) => a.y - b.y);
  for (const e of entities) {
    e.draw();
  }

  drawLumenCompanion(ctx, state.playerX, state.playerY, timeSec);

  if (state.isDashing || state.parryRemaining > 0) {
    const x = state.playerX * TILE_SIZE + 12;
    const y = state.playerY * TILE_SIZE + 12;
    ctx.strokeStyle = '#67E8F9';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(x, y, state.isDashing ? 15 : PARRY_RADIUS * TILE_SIZE, state.isDashing ? 11 : PARRY_RADIUS * TILE_SIZE, 0, 0, Math.PI * 2);
    ctx.stroke();
  }

  for (const proj of state.projectiles) {
    const cx = Math.round(proj.x * TILE_SIZE + 12);
    const cy = Math.round(proj.y * TILE_SIZE + 12);
    if (proj.fromPlayer) {
      px(ctx, cx - 5, cy - 5, 10, 10, '#05070B');
      px(ctx, cx - 3, cy - 3, 6, 6, proj.isReflected ? '#67E8F9' : proj.isOverdrive ? '#A855F7' : '#F59E0B');
      px(ctx, cx - 1, cy - 1, 2, 2, '#FFFFFF');
    } else {
      px(ctx, cx - 5, cy - 5, 10, 10, '#05070B');
      px(ctx, cx - 3, cy - 3, 6, 6, '#EF4444');
      px(ctx, cx - 1, cy - 1, 2, 2, '#FCA5A5');
    }
  }

  for (const pt of state.particles) {
    px(ctx, pt.x, pt.y, pt.size, pt.size, pt.color);
  }

  for (const pop of state.popups) {
    const cx = Math.round(pop.x);
    const cy = Math.round(pop.y);
    const bw = pop.text.length * 6 + 10;
    px(ctx, cx - Math.floor(bw / 2), cy - 6, bw, 13, '#05070B');
    px(ctx, cx - Math.floor(bw / 2) + 2, cy - 4, bw - 4, 9, pop.color);
    ctx.fillStyle = '#05070B';
    ctx.font = 'bold 8px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(pop.text, cx, cy + 1);
  }

  if (state.nearestTarget) {
    const nt = state.nearestTarget;
    if (nt.type === 'exit') {
      if (exitUnlocked) {
        drawInteractionBubble(ctx, nt.tileX, nt.tileY, 'SALIR', '#10B981');
      }
    } else if (nt.type === 'field') {
      drawInteractionBubble(ctx, nt.tileX, nt.tileY, 'EXAMINAR', '#C4B5FD');
    } else if (nt.type === 'chest') {
      drawInteractionBubble(ctx, nt.tileX, nt.tileY, 'ABRIR COFRE', '#F59E0B');
    } else if (nt.type === 'switch') {
      drawInteractionBubble(ctx, nt.tileX, nt.tileY, 'ACTIVAR', '#38BDF8');
    } else if (nt.type === 'gate') {
      drawInteractionBubble(
        ctx,
        nt.tileX,
        nt.tileY,
        nt.lockedReason ? nt.lockedReason.toUpperCase() : 'DESBLOQUEAR',
        nt.lockedReason ? '#EF4444' : '#34D399'
      );
    } else if (nt.shielded) {
      drawInteractionBubble(ctx, nt.tileX, nt.tileY, 'ESCUDO ACTIVO', '#EF4444');
    } else {
      drawInteractionBubble(ctx, nt.tileX, nt.tileY, 'ABRIR');
    }
  }

  ctx.restore();

  drawRoomMap(ctx, state, exitUnlocked, camX, camY);

  const boss = level.id === 5 ? state.bots.find((bot) => bot.isBoss && !bot.destroyed) : undefined;
  if (boss && Math.hypot(boss.x - state.playerX, boss.y - state.playerY) < 10) {
    const width = Math.min(168, ctx.canvas.width - 32);
    const x = (ctx.canvas.width - width) / 2;
    const y = Math.round(ctx.canvas.height * 0.77);
    const phase = boss.hp <= boss.maxHp / 2 ? 2 : 1;
    const color = phase === 2 ? '#FBBF24' : '#FB7185';
    px(ctx, x - 5, y - 16, width + 10, 30, '#090C18');
    px(ctx, x, y + 1, width, 7, '#35283F');
    px(ctx, x, y + 1, width * boss.hp / boss.maxHp, 7, color);
    ctx.fillStyle = color;
    ctx.font = 'bold 9px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`VOX-ZERO / FASE ${phase}`, ctx.canvas.width / 2, y - 7);
  }
}
