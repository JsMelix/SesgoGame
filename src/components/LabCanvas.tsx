import Phaser from 'phaser';
import { blocksMovement, blocksShot, clearDistance } from '../game/arenaGeometry';
import type { FieldSiteId } from './FieldTestModal';
import { canLeaveRoom, fieldRecord, fieldSites, gateIsOpen } from '../game/fieldwork';
import { ArenaTile, reachableTiles, routeFrom } from '../game/arenaGrid';
import { circuitPhase } from '../game/hazards';
import { ArenaScene } from '../game/ArenaScene';
import { ArenaObjective, chooseObjective } from '../game/objectives';
import { useEffect, useRef, useState } from 'react';
import { GRID_COLS, GRID_ROWS, TILE_SIZE } from '../data/levels';
import {
  ChestConfig,
  Direction,
  GateConfig,
  KeyColor,
  LabLevelConfig,
  PlayerProgress,
  SwitchConfig,
} from '../types/game';
import {
  DASH_COOLDOWN,
  DASH_DURATION,
  DASH_SPEED,
  directionVectors,
  PARRY_RADIUS,
  PARRY_WINDOW,
  SENTINEL_SHOT_SPEED,
  sentinelSpread,
} from '../utils/combat';
import { retroAudio } from '../utils/audio';
import {
  ActiveGlitchBot,
  ComicPopup,
  FloorPickup,
  NearTargetInfo,
  Projectile,
  SparkParticle,
} from './pixelRenderer';

export interface InventoryHudState {
  keys: Record<KeyColor, number>;
  chestsOpened: number;
  totalChests: number;
  overdriveSeconds: number;
  dashReady: boolean;
}

interface LabCanvasProps {
  level: LabLevelConfig;
  progress: PlayerProgress;
  isActivePlay: boolean;
  onOpenTerminal: (scenarioId: string) => void;
  onOpenFieldSite: (siteId: FieldSiteId) => void;
  onReachExit: () => void;
  onPlayerHpChange: (hp: number, maxHp: number) => void;
  onEnemiesRemainingChange: (count: number) => void;
  onInventoryChange: (inv: InventoryHudState) => void;
  onBotHit: () => void;
  onNearTargetChange: (
    target: {
      type: NearTargetInfo['type'];
      id: string;
      label: string;
      shielded?: boolean;
      lockedReason?: string;
    } | null
  ) => void;
  externalMoveDir?: Direction | null;
  triggerInteractSignal?: number;
  triggerPulseSignal?: number;
  triggerDashSignal?: number;
  onObjectiveChange: (text: string) => void;
}

const WORLD_WIDTH = GRID_COLS * TILE_SIZE; // 600
const WORLD_HEIGHT = GRID_ROWS * TILE_SIZE; // 360
const PLAYER_SPEED = 5.6;
const INTERACT_RADIUS = 1.95;
const MAX_HP = 5;

export function LabCanvas({
  level,
  progress,
  isActivePlay,
  onOpenTerminal,
  onOpenFieldSite,
  onReachExit,
  onPlayerHpChange,
  onEnemiesRemainingChange,
  onInventoryChange,
  onBotHit,
  onNearTargetChange,
  externalMoveDir,
  triggerInteractSignal,
  triggerPulseSignal,
  triggerDashSignal,
  onObjectiveChange,
}: LabCanvasProps) {
  const arenaHost = useRef<HTMLDivElement>(null);
  const heldKeysRef = useRef<Set<string>>(new Set());
  const lastDashSignal = useRef(triggerDashSignal);
  const lastInteractSignal = useRef(triggerInteractSignal);
  const lastPulseSignal = useRef(triggerPulseSignal);
  const externalDirRef = useRef<Direction | null>(null);

  const [viewSize, setViewSize] = useState<{ w: number; h: number }>({
    w: WORLD_WIDTH,
    h: WORLD_HEIGHT,
  });

  const simRef = useRef({
    playerX: level.spawnX,
    playerY: level.spawnY,
    dir: 'down' as Direction,
    walkPhase: 0,
    isMoving: false,
    hp: MAX_HP,
    hitFlash: 0,
    hitCooldown: 0,
    attackSwingTimer: 0,
    overdriveTimer: 0,
    roomTime: 0,
    shakeTime: 0,
    hitstopTime: 0,
    pulseCooldown: 0,
    dashCooldown: 0,
    dashRemaining: 0,
    dashVx: 0,
    dashVy: 0,
    parryRemaining: 0,
    pulseWave: null as { x: number; y: number; progress: number } | null,
    targetWalkPos: null as { path: ArenaTile[]; index: number; autoAction?: () => void } | null,
    camX: 0,
    camY: 0,
    keys: { gold: 0, crimson: 0, cyan: 0 } as Record<KeyColor, number>,
    openedChests: {} as Record<string, boolean>,
    openedGates: {} as Record<string, boolean>,
    activatedSwitches: {} as Record<string, boolean>,
    bots: [] as Array<ActiveGlitchBot & { wpIndex: number }>,
    projectiles: [] as Projectile[],
    pickups: [] as FloorPickup[],
    particles: [] as SparkParticle[],
    popups: [] as ComicPopup[],
  });

  const propsRef = useRef({
    level,
    progress,
    isActivePlay,
    viewSize,
    onOpenTerminal,
    onOpenFieldSite,
    onReachExit,
    onPlayerHpChange,
    onEnemiesRemainingChange,
    onInventoryChange,
    onBotHit,
    onNearTargetChange,
    onObjectiveChange,
  });
  propsRef.current = {
    level,
    progress,
    isActivePlay,
    viewSize,
    onOpenTerminal,
    onOpenFieldSite,
    onReachExit,
    onPlayerHpChange,
    onEnemiesRemainingChange,
    onInventoryChange,
    onBotHit,
    onNearTargetChange,
    onObjectiveChange,
  };

  useEffect(() => {
    externalDirRef.current = externalMoveDir ?? null;
    if (externalMoveDir) simRef.current.targetWalkPos = null;
  }, [externalMoveDir]);

  useEffect(() => {
    if (!arenaHost.current) return;
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      if (width < 1 || height < 1) return;
      const aspect = width / height;
      const maxWidth = width < 600 ? (aspect < 1 ? 312 : 440) : WORLD_WIDTH;
      const h = Math.min(WORLD_HEIGHT, Math.round(maxWidth / aspect));
      const w = Math.min(maxWidth, Math.round(h * aspect));
      setViewSize((previous) => previous.w === w && previous.h === h ? previous : { w, h });
    });
    observer.observe(arenaHost.current);
    return () => observer.disconnect();
  }, []);

  const syncInventoryHud = () => {
    const s = simRef.current;
    const lvl = propsRef.current.level;
    const chestsOpened = lvl.chests.filter((c) => s.openedChests[c.id]).length;
    propsRef.current.onInventoryChange({
      keys: { ...s.keys },
      chestsOpened,
      totalChests: lvl.chests.length,
      overdriveSeconds: Math.ceil(s.overdriveTimer),
      dashReady: s.dashCooldown <= 0,
    });
  };

  // Initialize level entities
  useEffect(() => {
    const initialBots = level.bots.map((b) => ({
      id: b.id,
      kind: b.kind,
      isBoss: Boolean(b.isBoss),
      aimAngle: 0,
      shotAngles: [0],
      linkedScenarioId: b.linkedScenarioId,
      dropsKeyColor: b.dropsKeyColor,
      dropsKeyLabel: b.dropsKeyLabel,
      x: b.waypoints[0].x,
      y: b.waypoints[0].y,
      hp: b.maxHp,
      maxHp: b.maxHp,
      hitFlash: 0,
      windupTimer: 0,
      recoveryTimer: 0,
      dashTimer: 0,
      dashVx: 0,
      dashVy: 0,
      shootCooldown: 2.0 + Math.random() * 1.2,
      wpIndex: 1 % b.waypoints.length,
      destroyed: Boolean(!b.isBoss && b.linkedScenarioId && progress.scenarios[b.linkedScenarioId]?.solved),
    }));

    // If a key-dropping bot was already cleared on re-entry, spawn its key on the floor so gates stay openable
    const initialPickups: FloorPickup[] = [];
    for (const bot of initialBots) {
      if (bot.destroyed && bot.dropsKeyColor) {
        initialPickups.push({
          id: `pk_init_${bot.id}`,
          kind: 'key',
          keyColor: bot.dropsKeyColor,
          keyLabel: bot.dropsKeyLabel,
          x: bot.x,
          y: bot.y,
          life: 9999,
        });
      }
    }

    simRef.current = {
      playerX: level.spawnX,
      playerY: level.spawnY,
      dir: 'down',
      walkPhase: 0,
      isMoving: false,
      hp: MAX_HP,
      hitFlash: 0,
      hitCooldown: 0,
      attackSwingTimer: 0,
      overdriveTimer: 0,
      roomTime: 0,
      shakeTime: 0,
      hitstopTime: 0,
      pulseCooldown: 0,
      dashCooldown: 0,
      dashRemaining: 0,
      dashVx: 0,
      dashVy: 0,
      parryRemaining: 0,
      pulseWave: null,
      targetWalkPos: null,
      camX: 0,
      camY: 0,
      keys: { gold: 0, crimson: 0, cyan: 0 },
      openedChests: {},
      openedGates: {},
      activatedSwitches: {},
      bots: initialBots,
      projectiles: [],
      pickups: initialPickups,
      particles: [],
      popups: [],
    };
    onPlayerHpChange(MAX_HP, MAX_HP);
    onEnemiesRemainingChange(initialBots.filter((b) => !b.destroyed).length);
    onInventoryChange({
      keys: { gold: 0, crimson: 0, cyan: 0 },
      chestsOpened: 0,
      totalChests: level.chests.length,
      overdriveSeconds: 0,
      dashReady: true,
    });
  }, [level.id]);

  useEffect(() => {
    if (!isActivePlay) {
      heldKeysRef.current.clear();
      simRef.current.isMoving = false;
      simRef.current.targetWalkPos = null;
      simRef.current.dashRemaining = 0;
      simRef.current.parryRemaining = 0;
    }
  }, [isActivePlay]);

  const gateState = (levelId: number) => ({
    openedGates: simRef.current.openedGates,
    fieldApplied: fieldRecord(propsRef.current.progress, levelId).applied,
  });

  const isBlocked = (x: number, y: number, level: LabLevelConfig) =>
    blocksMovement(level, gateState(level.id), x, y);

  const canAimAt = (level: LabLevelConfig, x: number, y: number, tx: number, ty: number) => {
    const distance = Math.hypot(tx - x, ty - y);
    const angle = Math.atan2(ty - y, tx - x);
    return clearDistance(level, gateState(level.id), x, y, angle, distance) === distance;
  };

  const isTerminalShielded = (scenarioId: string): boolean => {
    return simRef.current.bots.some(
      (b) => b.linkedScenarioId === scenarioId && !b.destroyed
    );
  };

  const spawnSparks = (tileX: number, tileY: number, color: string, count = 14) => {
    const s = simRef.current;
    for (let i = 0; i < count; i++) {
      const a = (Math.PI * 2 * i) / count;
      const spd = 28 + Math.random() * 48;
      s.particles.push({
        x: tileX * TILE_SIZE + 12,
        y: tileY * TILE_SIZE + 12,
        vx: Math.cos(a) * spd,
        vy: Math.sin(a) * spd,
        life: 0.45,
        maxLife: 0.45,
        color,
        size: 3,
      });
    }
  };

  const openChest = (chest: ChestConfig) => {
    const s = simRef.current;
    if (s.openedChests[chest.id]) return;
    s.openedChests[chest.id] = true;
    s.shakeTime = 0.14;

    if (chest.rewardType === 'key' && chest.keyColor) {
      s.keys[chest.keyColor] += 1;
      retroAudio.playKeyPickup();
      const label = chest.keyLabel ?? '¡LLAVE!';
      s.popups.push({
        x: chest.tileX * TILE_SIZE + 12,
        y: chest.tileY * TILE_SIZE - 8,
        text: `+ ${label.toUpperCase()}`,
        color:
          chest.keyColor === 'crimson'
            ? '#EF4444'
            : chest.keyColor === 'cyan'
            ? '#38BDF8'
            : '#F59E0B',
        life: 1.3,
      });
      spawnSparks(chest.tileX, chest.tileY, '#F59E0B', 16);
    } else if (chest.rewardType === 'overdrive') {
      s.overdriveTimer = 14;
      retroAudio.playOverdrive();
      s.popups.push({
        x: chest.tileX * TILE_SIZE + 12,
        y: chest.tileY * TILE_SIZE - 8,
        text: '¡OVERDRIVE 2X!',
        color: '#A855F7',
        life: 1.35,
      });
      spawnSparks(chest.tileX, chest.tileY, '#A855F7', 18);
    } else {
      s.hp = Math.min(MAX_HP, s.hp + 2);
      propsRef.current.onPlayerHpChange(s.hp, MAX_HP);
      retroAudio.playChestOpen();
      s.popups.push({
        x: chest.tileX * TILE_SIZE + 12,
        y: chest.tileY * TILE_SIZE - 8,
        text: '+2 ENERGÍA',
        color: '#34D399',
        life: 1.2,
      });
      spawnSparks(chest.tileX, chest.tileY, '#34D399', 14);
    }
    syncInventoryHud();
  };

  const activateSwitch = (sw: SwitchConfig) => {
    const s = simRef.current;
    if (s.activatedSwitches[sw.id]) return;
    s.activatedSwitches[sw.id] = true;
    retroAudio.playSwitchFlip();
    s.shakeTime = 0.16;
    s.popups.push({
      x: sw.tileX * TILE_SIZE + 12,
      y: sw.tileY * TILE_SIZE - 8,
      text: '¡BARRERA ABIERTA!',
      color: '#38BDF8',
      life: 1.2,
    });
    spawnSparks(sw.tileX, sw.tileY, '#38BDF8', 14);

    for (const g of propsRef.current.level.gates) {
      if (g.requiresSwitchId === sw.id && !s.openedGates[g.id]) {
        s.openedGates[g.id] = true;
        retroAudio.playGateUnlock();
        spawnSparks(g.tileX + g.widthTiles * 0.5, g.tileY + g.heightTiles * 0.5, '#10B981', 16);
      }
    }
  };

  const unlockGate = (gate: GateConfig) => {
    const s = simRef.current;
    if (gateIsOpen(gate, s.openedGates, fieldRecord(propsRef.current.progress, propsRef.current.level.id).applied)) return;
    if (gate.requiresFieldTest) {
      retroAudio.playError();
      return;
    }
    if (gate.requiresSwitchId) {
      retroAudio.playError();
      s.popups.push({
        x: (gate.tileX + gate.widthTiles * 0.5) * TILE_SIZE,
        y: gate.tileY * TILE_SIZE - 6,
        text: 'ACTIVA EL INTERRUPTOR',
        color: '#EF4444',
        life: 1.0,
      });
      return;
    }
    const needed = gate.keyColor ?? 'gold';
    if (s.keys[needed] > 0) {
      s.keys[needed] -= 1;
      s.openedGates[gate.id] = true;
      s.shakeTime = 0.16;
      retroAudio.playGateUnlock();
      s.popups.push({
        x: (gate.tileX + gate.widthTiles * 0.5) * TILE_SIZE,
        y: gate.tileY * TILE_SIZE - 6,
        text: '¡COMPUERTA ABIERTA!',
        color: '#34D399',
        life: 1.1,
      });
      spawnSparks(gate.tileX + gate.widthTiles * 0.5, gate.tileY + gate.heightTiles * 0.5, '#F59E0B', 16);
      syncInventoryHud();
    } else {
      retroAudio.playError();
      s.popups.push({
        x: (gate.tileX + gate.widthTiles * 0.5) * TILE_SIZE,
        y: gate.tileY * TILE_SIZE - 6,
        text: `FALTA ${(gate.keyLabel ?? 'LLAVE').toUpperCase()}`,
        color: '#EF4444',
        life: 1.0,
      });
    }
  };

  const findNearestTarget = (px: number, py: number, lvl: LabLevelConfig): NearTargetInfo | null => {
    const s = simRef.current;
    const record = fieldRecord(propsRef.current.progress, lvl.id);
    let best: (NearTargetInfo & { dist: number }) | null = null;

    for (const chest of lvl.chests) {
      if (s.openedChests[chest.id]) continue;
      const d = Math.hypot(px - chest.tileX, py - chest.tileY);
      if (d <= INTERACT_RADIUS && (!best || d < best.dist)) {
        best = {
          type: 'chest',
          id: chest.id,
          tileX: chest.tileX,
          tileY: chest.tileY,
          label: 'Cofre',
          dist: d,
        };
      }
    }

    for (const sw of lvl.switches) {
      if (s.activatedSwitches[sw.id]) continue;
      const d = Math.hypot(px - sw.tileX, py - sw.tileY);
      if (d <= INTERACT_RADIUS && (!best || d < best.dist)) {
        best = {
          type: 'switch',
          id: sw.id,
          tileX: sw.tileX,
          tileY: sw.tileY,
          label: sw.label,
          dist: d,
        };
      }
    }

    for (const gate of lvl.gates) {
      if (gateIsOpen(gate, s.openedGates, record.applied)) continue;
      const gx = gate.tileX + (gate.widthTiles - 1) * 0.5;
      const gy = gate.tileY + (gate.heightTiles - 1) * 0.5;
      const d = Math.hypot(px - gx, py - gy);
      if (d <= INTERACT_RADIUS + 0.3 && (!best || d < best.dist)) {
        let lockedReason: string | undefined;
        if (gate.requiresFieldTest) {
          lockedReason = 'Aplica la corrección de campo';
        } else if (gate.requiresSwitchId) {
          lockedReason = 'Requiere Interruptor';
        } else if (gate.keyColor && s.keys[gate.keyColor] <= 0) {
          lockedReason = `Falta ${gate.keyLabel ?? 'Llave'}`;
        }
        best = {
          type: 'gate',
          id: gate.id,
          tileX: gx,
          tileY: gy,
          label: gate.requiresFieldTest ? 'Ruta de revisión' : gate.keyLabel ?? 'Compuerta',
          lockedReason,
          dist: d,
        };
      }
    }

    for (const t of lvl.terminals) {
      const shielded = isTerminalShielded(t.scenarioId);
      const dTerm = Math.hypot(px - t.tileX, py - t.tileY);
      if (dTerm <= INTERACT_RADIUS && (!best || dTerm < best.dist)) {
        best = {
          type: 'terminal',
          id: t.scenarioId,
          tileX: t.tileX,
          tileY: t.tileY,
          label: `Terminal 0${t.terminalNumber}`,
          shielded,
          dist: dTerm,
        };
      }
      const dNpc = Math.hypot(px - t.npcTileX, py - t.npcTileY);
      if (dNpc <= INTERACT_RADIUS && (!best || dNpc < best.dist)) {
        best = {
          type: 'npc',
          id: t.scenarioId,
          tileX: t.npcTileX,
          tileY: t.npcTileY,
          label: `Caso 0${t.terminalNumber}`,
          shielded,
          dist: dNpc,
        };
      }
    }

    for (const site of fieldSites(lvl.id)) {
      const dist = Math.hypot(px - site.x, py - site.y);
      if (dist <= INTERACT_RADIUS && (!best || dist < best.dist)) {
        best = { type: 'field', id: site.id, tileX: site.x, tileY: site.y, label: site.title, dist };
      }
    }

    const dExit = Math.hypot(px - lvl.exitX, py - lvl.exitY);
    if (dExit <= INTERACT_RADIUS && (!best || dExit < best.dist)) {
      best = {
        type: 'exit',
        id: 'exit',
        tileX: lvl.exitX,
        tileY: lvl.exitY,
        label: 'Portal',
        lockedReason: canLeaveRoom(lvl, propsRef.current.progress, s.bots.filter((bot) => !bot.destroyed).length)
          ? undefined
          : 'Faltan la prueba, casos o guardias',
        dist: dExit,
      };
    }

    if (!best) return null;
    const { dist: _d, ...rest } = best;
    return rest;
  };

  const damageBot = (bot: ActiveGlitchBot, amount: number, knockVx: number, knockVy: number) => {
    if (bot.destroyed) return;
    const s = simRef.current;
    const exposed = bot.recoveryTimer > 0;
    if (exposed) {
      bot.recoveryTimer = 0;
      amount += 1;
    }
    bot.hp -= amount;
    bot.hitFlash = 0.25;
    s.hitstopTime = 0.04;
    s.shakeTime = 0.14;

    if (!isBlocked(bot.x + knockVx * 0.45, bot.y + knockVy * 0.45, propsRef.current.level)) {
      bot.x += knockVx * 0.45;
      bot.y += knockVy * 0.45;
    }

    if (bot.hp <= 0) {
      bot.destroyed = true;
      retroAudio.playEnemyDestroy();
      s.shakeTime = 0.25;
      s.popups.push({
        x: bot.x * TILE_SIZE + 12,
        y: bot.y * TILE_SIZE - 4,
        text: '¡KRAK!',
        color: '#F59E0B',
        life: 0.9,
      });

      if (bot.linkedScenarioId) {
        const sameGroupAlive = s.bots.some(
          (other) => other.linkedScenarioId === bot.linkedScenarioId && !other.destroyed
        );
        if (!sameGroupAlive) {
          const term = propsRef.current.level.terminals.find(
            (t) => t.scenarioId === bot.linkedScenarioId
          );
          if (term) {
            retroAudio.playShieldDown();
            s.popups.push({
              x: term.tileX * TILE_SIZE + 12,
              y: term.tileY * TILE_SIZE - 12,
              text: '¡ESCUDO ROTO!',
              color: '#34D399',
              life: 1.25,
            });
          }
        }
      }

      if (bot.dropsKeyColor) {
        s.pickups.push({
          id: `pk_key_${bot.id}_${performance.now()}`,
          kind: 'key',
          keyColor: bot.dropsKeyColor,
          keyLabel: bot.dropsKeyLabel,
          x: bot.x,
          y: bot.y,
          life: 9999,
        });
      } else {
        s.pickups.push({
          id: `pk_${bot.id}_${performance.now()}`,
          kind: 'heal',
          x: bot.x,
          y: bot.y,
          life: 16,
        });
      }

      spawnSparks(bot.x, bot.y, '#EF4444', 18);
      const remaining = s.bots.filter((b) => !b.destroyed).length;
      propsRef.current.onEnemiesRemainingChange(remaining);
    } else {
      retroAudio.playEnemyHit();
      s.popups.push({
        x: bot.x * TILE_SIZE + 12,
        y: bot.y * TILE_SIZE - 4,
        text: amount > 1 ? '¡CRÍTICO!' : '¡ZAP!',
        color: amount > 1 ? '#A855F7' : '#38BDF8',
        life: 0.55,
      });
      spawnSparks(bot.x, bot.y, '#38BDF8', 8);
    }
  };

  const fireGuitarAttack = (targetX?: number, targetY?: number) => {
    const s = simRef.current;
    if (s.pulseCooldown > 0) return;
    const { level } = propsRef.current;
    const isOverdrive = s.overdriveTimer > 0;
    s.pulseCooldown = isOverdrive ? 0.24 : 0.38;
    s.attackSwingTimer = 0.22;
    s.parryRemaining = PARRY_WINDOW;
    s.pulseWave = { x: s.playerX, y: s.playerY, progress: 0.08 };
    retroAudio.playPulseZap();

    let aimVx = s.dir === 'left' ? -1 : s.dir === 'right' ? 1 : 0;
    let aimVy = s.dir === 'up' ? -1 : s.dir === 'down' ? 1 : 0;

    if (targetX !== undefined && targetY !== undefined) {
      const d = Math.hypot(targetX - s.playerX, targetY - s.playerY);
      if (d > 0.05) {
        aimVx = (targetX - s.playerX) / d;
        aimVy = (targetY - s.playerY) / d;
      }
    } else {
      let closestDist = 7.5;
      for (const bot of s.bots) {
        if (bot.destroyed) continue;
        const d = Math.hypot(bot.x - s.playerX, bot.y - s.playerY);
        if (d < closestDist && canAimAt(level, s.playerX, s.playerY, bot.x, bot.y)) {
          closestDist = d;
          aimVx = (bot.x - s.playerX) / Math.max(0.1, d);
          aimVy = (bot.y - s.playerY) / Math.max(0.1, d);
        }
      }
    }

    const dmg = isOverdrive ? 2 : 1;
    s.projectiles.push({
      x: s.playerX,
      y: s.playerY,
      vx: aimVx * 11.5,
      vy: aimVy * 11.5,
      fromPlayer: true,
      damage: dmg,
      isOverdrive,
      life: 0.9,
    });

    if (isOverdrive) {
      const angle = Math.atan2(aimVy, aimVx);
      for (const offset of [-0.22, 0.22]) {
        s.projectiles.push({
          x: s.playerX,
          y: s.playerY,
          vx: Math.cos(angle + offset) * 11.5,
          vy: Math.sin(angle + offset) * 11.5,
          fromPlayer: true,
          damage: 1,
          isOverdrive: true,
          life: 0.8,
        });
      }
    }

    for (const bot of s.bots) {
      if (bot.destroyed) continue;
      const d = Math.hypot(bot.x - s.playerX, bot.y - s.playerY);
      if (d <= 2.3 && canAimAt(level, s.playerX, s.playerY, bot.x, bot.y)) {
        const kx = (bot.x - s.playerX) / Math.max(0.2, d);
        const ky = (bot.y - s.playerY) / Math.max(0.2, d);
        damageBot(bot, dmg, kx, ky);
      }
    }
  };

  const startDash = () => {
    const s = simRef.current;
    if (!propsRef.current.isActivePlay || s.dashCooldown > 0 || s.hp <= 0) return;
    const keys = heldKeysRef.current;
    const x = Number(keys.has('d') || keys.has('arrowright')) - Number(keys.has('a') || keys.has('arrowleft'));
    const y = Number(keys.has('s') || keys.has('arrowdown')) - Number(keys.has('w') || keys.has('arrowup'));
    const [dx, dy] = x || y ? [x, y] : directionVectors[externalDirRef.current ?? s.dir];
    const length = Math.hypot(dx, dy);
    s.dashVx = dx / length;
    s.dashVy = dy / length;
    s.dashRemaining = DASH_DURATION;
    s.dashCooldown = DASH_COOLDOWN;
    s.targetWalkPos = null;
    retroAudio.playDash();
    spawnSparks(s.playerX, s.playerY, '#67E8F9', 9);
    syncInventoryHud();
  };

  const triggerInteraction = () => {
    const { level: lvl, progress: prog, onOpenTerminal: openTerm, onOpenFieldSite, onReachExit: reachExit } =
      propsRef.current;
    const s = simRef.current;
    const target = findNearestTarget(s.playerX, s.playerY, lvl);
    if (!target) return;

    if (target.type === 'chest') {
      const chest = lvl.chests.find((c) => c.id === target.id);
      if (chest) openChest(chest);
      return;
    }

    if (target.type === 'switch') {
      const sw = lvl.switches.find((x) => x.id === target.id);
      if (sw) activateSwitch(sw);
      return;
    }

    if (target.type === 'gate') {
      const gate = lvl.gates.find((g) => g.id === target.id);
      if (gate) unlockGate(gate);
      return;
    }

    if (target.type === 'field') {
      retroAudio.playInteract();
      const site = fieldSites(lvl.id).find((item) => item.id === target.id);
      if (site) onOpenFieldSite(site.id);
      return;
    }

    if (target.type === 'terminal' || target.type === 'npc') {
      if (target.shielded) {
        retroAudio.playError();
        s.popups.push({
          x: target.tileX * TILE_SIZE + 12,
          y: target.tileY * TILE_SIZE - 8,
          text: '¡VENCE AL BOT!',
          color: '#EF4444',
          life: 0.9,
        });
        return;
      }
      retroAudio.playInteract();
      openTerm(target.id);
    } else if (target.type === 'exit') {
      if (canLeaveRoom(lvl, prog, s.bots.filter((bot) => !bot.destroyed).length)) {
        retroAudio.playInteract();
        reachExit();
      } else {
        retroAudio.playError();
      }
    }
  };

  useEffect(() => {
    if (triggerInteractSignal !== lastInteractSignal.current) {
      lastInteractSignal.current = triggerInteractSignal;
      if (isActivePlay) triggerInteraction();
    }
  }, [triggerInteractSignal]);

  useEffect(() => {
    if (triggerPulseSignal !== lastPulseSignal.current) {
      lastPulseSignal.current = triggerPulseSignal;
      if (isActivePlay) fireGuitarAttack();
    }
  }, [triggerPulseSignal]);

  useEffect(() => {
    if (triggerDashSignal !== lastDashSignal.current) {
      lastDashSignal.current = triggerDashSignal;
      startDash();
    }
  }, [triggerDashSignal]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (!propsRef.current.isActivePlay) return;
      const key = e.key.toLowerCase();
      if ((key === ' ' || key === 'enter') && e.target instanceof HTMLButtonElement) return;

      if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(key)) {
        e.preventDefault();
      }

      if (key === 'e' || key === ' ' || key === 'enter') {
        if (!e.repeat) triggerInteraction();
        return;
      }

      if (key === 'q' || key === 'j') {
        if (!e.repeat) fireGuitarAttack();
        return;
      }

      if (key === 'shift') {
        if (!e.repeat) startDash();
        return;
      }

      if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key)) {
        simRef.current.targetWalkPos = null;
        heldKeysRef.current.add(key);
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      heldKeysRef.current.delete(e.key.toLowerCase());
    };

    const onBlur = () => {
      heldKeysRef.current.clear();
      simRef.current.isMoving = false;
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', onBlur);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', onBlur);
    };
  }, []);

  useEffect(() => {
    if (!arenaHost.current) return;
    let objective: ArenaObjective | null = null;
    let nextObjectiveCheck = 0;
    let lastObjectiveText = '';
    let lastReportedKey = '';
    let lastReportedOverdriveSec = 0;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    const applyPlayerHit = () => {
      const s = simRef.current;
      if (s.hitCooldown > 0 || s.dashRemaining > 0 || s.hp <= 0) return;
      s.hitCooldown = 1.1;
      s.hitFlash = 0.65;
      s.shakeTime = 0.22;
      s.hp = Math.max(0, s.hp - 1);
      retroAudio.playBotHit();
      propsRef.current.onPlayerHpChange(s.hp, MAX_HP);
      propsRef.current.onBotHit();
      s.popups.push({
        x: s.playerX * TILE_SIZE + 12,
        y: s.playerY * TILE_SIZE - 10,
        text: '¡GLITCH!',
        color: '#F87171',
        life: 0.75,
      });
      spawnSparks(s.playerX, s.playerY, '#EF4444', 10);
    };

    const tick = (scene: ArenaScene, now: number, delta: number) => {
      const dt = Math.min(delta / 1000, 0.05);
      const timeSec = now / 1000;

      const {
        level: lvl,
        progress: prog,
        isActivePlay: active,
        viewSize: vs,
        onNearTargetChange: notifyTarget,
      } = propsRef.current;
      const s = simRef.current;

      if (s.hitstopTime > 0) {
        s.hitstopTime = Math.max(0, s.hitstopTime - dt);
      } else if (active) {
        s.roomTime += dt;
        s.hitFlash = Math.max(0, s.hitFlash - dt);
        s.hitCooldown = Math.max(0, s.hitCooldown - dt);
        s.attackSwingTimer = Math.max(0, s.attackSwingTimer - dt);
        s.shakeTime = Math.max(0, s.shakeTime - dt);
        s.pulseCooldown = Math.max(0, s.pulseCooldown - dt);
        const dashWasCooling = s.dashCooldown > 0;
        s.dashCooldown = Math.max(0, s.dashCooldown - dt);
        if (dashWasCooling && s.dashCooldown === 0) syncInventoryHud();
        s.parryRemaining = Math.max(0, s.parryRemaining - dt);

        if (s.overdriveTimer > 0) {
          s.overdriveTimer = Math.max(0, s.overdriveTimer - dt);
          const secNow = Math.ceil(s.overdriveTimer);
          if (secNow !== lastReportedOverdriveSec) {
            lastReportedOverdriveSec = secNow;
            syncInventoryHud();
          }
        }

        if (s.pulseWave) {
          s.pulseWave.progress += dt * 4.2;
          if (s.pulseWave.progress >= 1) s.pulseWave = null;
        }

        let vx = 0;
        let vy = 0;
        const keys = heldKeysRef.current;
        if (keys.has('w') || keys.has('arrowup') || externalDirRef.current === 'up') vy -= 1;
        if (keys.has('s') || keys.has('arrowdown') || externalDirRef.current === 'down') vy += 1;
        if (keys.has('a') || keys.has('arrowleft') || externalDirRef.current === 'left') vx -= 1;
        if (keys.has('d') || keys.has('arrowright') || externalDirRef.current === 'right') vx += 1;

        if (vx === 0 && vy === 0 && s.targetWalkPos) {
          const walk = s.targetWalkPos;
          let point = walk.path[walk.index];
          while (point && Math.hypot(point.x - s.playerX, point.y - s.playerY) < 0.18) {
            walk.index++;
            point = walk.path[walk.index];
          }
          if (!point) {
            s.targetWalkPos = null;
            walk.autoAction?.();
          } else {
            vx = point.x - s.playerX;
            vy = point.y - s.playerY;
          }
        }

        const dashing = s.dashRemaining > 0;
        if (dashing) {
          vx = s.dashVx;
          vy = s.dashVy;
        }

        if (vx !== 0 || vy !== 0) {
          const len = Math.hypot(vx, vy);
          vx /= len;
          vy /= len;
          if (Math.abs(vx) > Math.abs(vy)) {
            s.dir = vx > 0 ? 'right' : 'left';
          } else {
            s.dir = vy > 0 ? 'down' : 'up';
          }

          const speed = dashing ? DASH_SPEED : PLAYER_SPEED;
          const distance = dashing
            ? speed * Math.min(dt, s.dashRemaining)
            : Math.min(speed * dt, s.targetWalkPos ? len : Infinity);
          const nextX = s.playerX + vx * distance;
          const nextY = s.playerY + vy * distance;

          // Auto-unlock key gate when walking right up to it while holding matching key
          for (const g of lvl.gates) {
            if (s.openedGates[g.id] || g.requiresSwitchId || !g.keyColor) continue;
            if (s.keys[g.keyColor] > 0) {
              const gx = g.tileX + (g.widthTiles - 1) * 0.5;
              const gy = g.tileY + (g.heightTiles - 1) * 0.5;
              if (Math.hypot(nextX - gx, nextY - gy) < 1.35) {
                unlockGate(g);
              }
            }
          }

          let moved = false;
          if (!isBlocked(nextX, s.playerY, lvl)) {
            s.playerX = nextX;
            moved = true;
          }
          if (!isBlocked(s.playerX, nextY, lvl)) {
            s.playerY = nextY;
            moved = true;
          }
          s.isMoving = moved;
          if (moved) {
            s.walkPhase += dt * 15;
            retroAudio.playStep();
          } else {
            s.targetWalkPos = null;
          }
        } else {
          s.isMoving = false;
        }

        for (const circuit of lvl.circuits ?? []) {
          if (circuitPhase(s.roomTime, circuit.offset) !== 'live') continue;
          if (
            s.playerX >= circuit.tileX - 0.4 &&
            s.playerX <= circuit.tileX + circuit.widthTiles - 0.6 &&
            s.playerY >= circuit.tileY - 0.4 &&
            s.playerY <= circuit.tileY + circuit.heightTiles - 0.6
          ) {
            applyPlayerHit();
          }
        }

        // Auto-activate switches on step!
        for (const sw of lvl.switches) {
          if (!s.activatedSwitches[sw.id] && Math.hypot(sw.tileX - s.playerX, sw.tileY - s.playerY) < 0.8) {
            activateSwitch(sw);
          }
        }

        // Update pickups (Health & Dropped Keys)
        for (let i = s.pickups.length - 1; i >= 0; i--) {
          const pk = s.pickups[i];
          if (pk.kind !== 'key') pk.life -= dt;
          if (Math.hypot(pk.x - s.playerX, pk.y - s.playerY) < 0.9) {
            if (pk.kind === 'key' && pk.keyColor) {
              s.keys[pk.keyColor] += 1;
              retroAudio.playKeyPickup();
              s.popups.push({
                x: s.playerX * TILE_SIZE + 12,
                y: s.playerY * TILE_SIZE - 8,
                text: `+ ${(pk.keyLabel ?? 'LLAVE').toUpperCase()}`,
                color: '#F59E0B',
                life: 1.25,
              });
              syncInventoryHud();
            } else {
              s.hp = Math.min(MAX_HP, s.hp + 1);
              propsRef.current.onPlayerHpChange(s.hp, MAX_HP);
              retroAudio.playPickup();
              s.popups.push({
                x: s.playerX * TILE_SIZE + 12,
                y: s.playerY * TILE_SIZE - 8,
                text: '+1 ENERGÍA',
                color: '#34D399',
                life: 0.75,
              });
            }
            s.pickups.splice(i, 1);
          } else if (pk.life <= 0) {
            s.pickups.splice(i, 1);
          }
        }

        // Update projectiles
        for (let i = s.projectiles.length - 1; i >= 0; i--) {
          const p = s.projectiles[i];
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          p.life -= dt;

          let remove = p.life <= 0 || blocksShot(lvl, gateState(lvl.id), p.x, p.y);

          if (!remove && p.fromPlayer) {
            // Guitar bolts can also trigger Sonic Switches!
            for (const sw of lvl.switches) {
              if (!s.activatedSwitches[sw.id] && Math.hypot(sw.tileX - p.x, sw.tileY - p.y) < 0.85) {
                activateSwitch(sw);
                remove = true;
                break;
              }
            }
            if (!remove) {
              for (const bot of s.bots) {
                if (bot.destroyed) continue;
                if (Math.hypot(bot.x - p.x, bot.y - p.y) < 0.8) {
                  const plen = Math.hypot(p.vx, p.vy) || 1;
                  damageBot(bot, p.damage ?? 1, p.vx / plen, p.vy / plen);
                  remove = true;
                  break;
                }
              }
            }
          } else if (!remove) {
            const distance = Math.hypot(s.playerX - p.x, s.playerY - p.y);
            if (s.parryRemaining > 0 && distance < PARRY_RADIUS) {
              p.fromPlayer = true;
              p.isReflected = true;
              p.damage = 3;
              p.vx *= -2.5;
              p.vy *= -2.5;
              p.life = 1.05;
              retroAudio.playParry();
              spawnSparks(p.x, p.y, '#67E8F9', 10);
              s.popups.push({
                x: s.playerX * TILE_SIZE + 12,
                y: s.playerY * TILE_SIZE - 12,
                text: '¡REBOTE!',
                color: '#67E8F9',
                life: 0.65,
              });
            } else if (distance < 0.68 && s.dashRemaining === 0) {
              applyPlayerHit();
              remove = true;
            }
          }

          if (remove) s.projectiles.splice(i, 1);
        }

        // Update patrolling enemies & AI behaviors
        for (const bot of s.bots) {
          if (bot.destroyed) continue;
          bot.hitFlash = Math.max(0, bot.hitFlash - dt);
          bot.recoveryTimer = Math.max(0, bot.recoveryTimer - dt);

          const distToPlayer = Math.hypot(s.playerX - bot.x, s.playerY - bot.y);

          if (bot.kind === 'echo_bot') {
            if (bot.dashTimer > 0) {
              bot.dashTimer -= dt;
              const nx = bot.x + bot.dashVx * 7.3 * dt;
              const ny = bot.y + bot.dashVy * 7.3 * dt;
              if (!isBlocked(nx, ny, lvl)) {
                bot.x = nx;
                bot.y = ny;
              } else {
                bot.dashTimer = 0;
              }
              if (bot.dashTimer <= 0) bot.recoveryTimer = 0.72;
            } else if (bot.windupTimer > 0) {
              bot.windupTimer -= dt;
              if (bot.windupTimer <= 0) {
                bot.dashVx = Math.cos(bot.aimAngle);
                bot.dashVy = Math.sin(bot.aimAngle);
                bot.dashTimer = 0.42;
              }
            } else if (distToPlayer < 4.2 && bot.shootCooldown <= 0 && canAimAt(lvl, bot.x, bot.y, s.playerX, s.playerY)) {
              bot.aimAngle = Math.atan2(s.playerY - bot.y, s.playerX - bot.x);
              bot.windupTimer = 0.5;
              bot.shootCooldown = 3.2;
            } else {
              bot.shootCooldown = Math.max(0, bot.shootCooldown - dt);
              const cfg = lvl.bots.find((b) => b.id === bot.id);
              if (bot.recoveryTimer === 0 && cfg && cfg.waypoints.length > 0) {
                const wp = cfg.waypoints[bot.wpIndex % cfg.waypoints.length];
                const dx = wp.x - bot.x;
                const dy = wp.y - bot.y;
                const dist = Math.hypot(dx, dy);
                if (dist < 0.15) bot.wpIndex = (bot.wpIndex + 1) % cfg.waypoints.length;
                else {
                  bot.x += (dx / dist) * cfg.speed * dt;
                  bot.y += (dy / dist) * cfg.speed * dt;
                }
              }
            }
          } else {
            const cfg = lvl.bots.find((b) => b.id === bot.id);
            if (bot.windupTimer === 0 && bot.recoveryTimer === 0 && cfg && cfg.waypoints.length > 0) {
              const wp = cfg.waypoints[bot.wpIndex % cfg.waypoints.length];
              const dx = wp.x - bot.x;
              const dy = wp.y - bot.y;
              const dist = Math.hypot(dx, dy);
              if (dist < 0.15) bot.wpIndex = (bot.wpIndex + 1) % cfg.waypoints.length;
              else {
                bot.x += (dx / dist) * cfg.speed * dt;
                bot.y += (dy / dist) * cfg.speed * dt;
              }
            }

            if (bot.kind === 'vox_sentinel') {
              bot.shootCooldown = Math.max(0, bot.shootCooldown - dt);
              if (bot.windupTimer > 0) {
                bot.windupTimer = Math.max(0, bot.windupTimer - dt);
                if (bot.windupTimer === 0) {
                  bot.recoveryTimer = 0.65;
                  for (const offset of bot.shotAngles) {
                    const angle = bot.aimAngle + offset;
                    s.projectiles.push({
                      x: bot.x,
                      y: bot.y,
                      vx: Math.cos(angle) * SENTINEL_SHOT_SPEED,
                      vy: Math.sin(angle) * SENTINEL_SHOT_SPEED,
                      fromPlayer: false,
                      life: 1.85,
                    });
                  }
                }
              } else if (bot.shootCooldown === 0 && distToPlayer < (bot.isBoss ? 9 : 7.2) && canAimAt(lvl, bot.x, bot.y, s.playerX, s.playerY)) {
                bot.aimAngle = Math.atan2(s.playerY - bot.y, s.playerX - bot.x);
                bot.shotAngles = sentinelSpread(bot.isBoss, bot.hp, bot.maxHp);
                bot.windupTimer = bot.isBoss ? 0.75 : 0.55;
                bot.shootCooldown = bot.shotAngles.length > 3 ? 1.75 : 2.5;
                if (bot.isBoss) retroAudio.playBossCharge();
              }
            }
          }

          if (Math.hypot(bot.x - s.playerX, bot.y - s.playerY) < 0.72) {
            applyPlayerHit();
          }
        }
        s.dashRemaining = Math.max(0, s.dashRemaining - dt);
      } else {
        s.isMoving = false;
      }

      if (Math.random() < dt * 4) {
        s.particles.push({
          x: Math.random() * WORLD_WIDTH,
          y: 36 + Math.random() * (WORLD_HEIGHT - 72),
          vx: (Math.random() - 0.5) * 10,
          vy: -12 - Math.random() * 14,
          life: 0.75,
          maxLife: 0.75,
          color: Math.random() > 0.5 ? '#F59E0B' : '#38BDF8',
          size: 2,
        });
      }

      for (let i = s.particles.length - 1; i >= 0; i--) {
        const pt = s.particles[i];
        pt.x += pt.vx * dt;
        pt.y += pt.vy * dt;
        pt.life -= dt;
        if (pt.life <= 0) s.particles.splice(i, 1);
      }
      for (let i = s.popups.length - 1; i >= 0; i--) {
        const pop = s.popups[i];
        pop.y -= 24 * dt;
        pop.life -= dt;
        if (pop.life <= 0) s.popups.splice(i, 1);
      }

      const targetCamX = Math.max(
        0,
        Math.min(WORLD_WIDTH - vs.w, s.playerX * TILE_SIZE + 12 - vs.w / 2)
      );
      const targetCamY = Math.max(
        0,
        Math.min(WORLD_HEIGHT - vs.h, s.playerY * TILE_SIZE + 12 - vs.h / 2)
      );
      s.camX += (targetCamX - s.camX) * Math.min(1, dt * 10);
      s.camY += (targetCamY - s.camY) * Math.min(1, dt * 10);

      const shakeMag = reduceMotion.matches ? 0 : s.shakeTime * 18;
      const shakeOffset = {
        x: (Math.random() - 0.5) * shakeMag,
        y: (Math.random() - 0.5) * shakeMag,
      };

      const nearest = active ? findNearestTarget(s.playerX, s.playerY, lvl) : null;
      const reportedKey = nearest
        ? `${nearest.type}:${nearest.id}:${Boolean(nearest.shielded)}:${nearest.lockedReason ?? ''}`
        : '';
      if (reportedKey !== lastReportedKey) {
        lastReportedKey = reportedKey;
        notifyTarget(
          nearest
            ? {
                type: nearest.type,
                id: nearest.id,
                label: nearest.label,
                shielded: nearest.shielded,
                lockedReason: nearest.lockedReason,
              }
            : null
        );
      }

      if (active && now >= nextObjectiveCheck) {
        objective = chooseObjective(lvl, prog, s, (x, y) => isBlocked(x, y, lvl));
        nextObjectiveCheck = now + 240;
        const text = objective?.text ?? 'Consulta el mapa y busca la llave o el interruptor que abre el paso.';
        if (text !== lastObjectiveText) {
          lastObjectiveText = text;
          propsRef.current.onObjectiveChange(text);
        }
      }

      if (objective) {
        const bot = s.bots.find((item) => item.id === objective?.id);
        if (bot) objective = bot.destroyed ? null : { ...objective, x: bot.x, y: bot.y };
      }

      scene.present({
        level: lvl,
        playerX: s.playerX,
        playerY: s.playerY,
        playerDir: s.dir,
        walkPhase: s.walkPhase,
        isMoving: s.isMoving,
        playerHitFlash: s.hitFlash,
        isDashing: s.dashRemaining > 0,
        parryRemaining: s.parryRemaining,
        attackSwingTimer: s.attackSwingTimer,
        overdriveTimer: s.overdriveTimer,
        pulseWave: s.pulseWave,
        bots: s.bots,
        openedChests: s.openedChests,
        openedGates: s.openedGates,
        activatedSwitches: s.activatedSwitches,
        projectiles: s.projectiles,
        pickups: s.pickups,
        particles: s.particles,
        popups: s.popups,
        shakeOffset,
        timeSec,
        roomTime: s.roomTime,
        progress: prog,
        nearestTarget: nearest,
        objective: active ? objective : null,
        path: active && s.targetWalkPos ? s.targetWalkPos.path.slice(s.targetWalkPos.index) : [],
      }, s.camX, s.camY, vs);
    };

    const game = new Phaser.Game({
      type: Phaser.AUTO,
      parent: arenaHost.current,
      width: viewSize.w,
      height: viewSize.h,
      backgroundColor: '#070d18',
      scene: new ArenaScene(level, viewSize, tick, handleArenaTap),
      pixelArt: true,
      banner: false,
      scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
      input: { keyboard: false, gamepad: false },
      audio: { noAudio: true },
      callbacks: {
        postBoot: (instance) => {
          instance.canvas.setAttribute('aria-label', `Tablero interactivo del ${level.title}`);
          instance.canvas.className = 'pixel-canvas cursor-pointer';
        },
      },
    });
    return () => game.destroy(true);
  }, []);

  const walkTo = (x: number, y: number, autoAction?: () => void) => {
    const s = simRef.current;
    const { level } = propsRef.current;
    const tiles = reachableTiles({ x: s.playerX, y: s.playerY }, (tx, ty) => isBlocked(tx, ty, level));
    const target = autoAction
      ? tiles.find((tile) => Math.hypot(tile.x - x, tile.y - y) <= 1.7)
      : tiles.find((tile) => tile.x === Math.round(x) && tile.y === Math.round(y));
    s.targetWalkPos = target ? { path: routeFrom(target), index: 0, autoAction } : null;
  };

  const handleArenaTap = (worldPxX: number, worldPxY: number) => {
    const { isActivePlay, level, progress, onOpenTerminal, onOpenFieldSite, onReachExit } = propsRef.current;
    if (!isActivePlay) return;
    const tileX = worldPxX / TILE_SIZE;
    const tileY = worldPxY / TILE_SIZE;

    for (const site of fieldSites(level.id)) {
      // The rendered center of an object is half a tile past its simulation anchor.
      if (Math.hypot(tileX - site.x - 0.5, tileY - site.y - 0.5) > 0.75) continue;
      const open = () => {
        retroAudio.playInteract();
        onOpenFieldSite(site.id);
      };
      if (Math.hypot(simRef.current.playerX - site.x, simRef.current.playerY - site.y) <= 1.7) open();
      else walkTo(site.x, site.y, open);
      return;
    }

    for (const bot of simRef.current.bots) {
      if (bot.destroyed) continue;
      if (Math.hypot(tileX - bot.x, tileY - bot.y) < 1.35) {
        fireGuitarAttack(bot.x, bot.y);
        return;
      }
    }

    for (const chest of level.chests) {
      if (simRef.current.openedChests[chest.id]) continue;
      if (Math.hypot(tileX - chest.tileX, tileY - chest.tileY) < 1.25) {
        const distNow = Math.hypot(simRef.current.playerX - chest.tileX, simRef.current.playerY - chest.tileY);
        if (distNow <= INTERACT_RADIUS + 0.3) {
          openChest(chest);
        } else {
          walkTo(chest.tileX, chest.tileY, () => openChest(chest));
        }
        return;
      }
    }

    for (const sw of level.switches) {
      if (simRef.current.activatedSwitches[sw.id]) continue;
      if (Math.hypot(tileX - sw.tileX, tileY - sw.tileY) < 1.2) {
        fireGuitarAttack(sw.tileX, sw.tileY);
        return;
      }
    }

    for (const gate of level.gates) {
      if (gateIsOpen(gate, simRef.current.openedGates, fieldRecord(progress, level.id).applied)) continue;
      const gx = gate.tileX + (gate.widthTiles - 1) * 0.5;
      const gy = gate.tileY + (gate.heightTiles - 1) * 0.5;
      if (Math.hypot(tileX - gx, tileY - gy) < 1.45) {
        if (Math.hypot(simRef.current.playerX - gx, simRef.current.playerY - gy) <= INTERACT_RADIUS + 0.4) {
          unlockGate(gate);
        } else {
          walkTo(gx, gy, () => unlockGate(gate));
        }
        return;
      }
    }

    for (const t of level.terminals) {
      if (
        Math.hypot(tileX - t.tileX, tileY - t.tileY) < 1.3 ||
        Math.hypot(tileX - t.npcTileX, tileY - t.npcTileY) < 1.2
      ) {
        const distNow = Math.hypot(simRef.current.playerX - t.tileX, simRef.current.playerY - t.tileY);
        if (distNow <= INTERACT_RADIUS + 0.3) {
          if (isTerminalShielded(t.scenarioId)) {
            retroAudio.playError();
            simRef.current.popups.push({
              x: t.tileX * TILE_SIZE + 12,
              y: t.tileY * TILE_SIZE - 8,
              text: '¡VENCE AL BOT!',
              color: '#EF4444',
              life: 0.9,
            });
          } else {
            retroAudio.playInteract();
            onOpenTerminal(t.scenarioId);
          }
        } else {
          walkTo(t.tileX, t.tileY, () => {
            if (!isTerminalShielded(t.scenarioId)) {
              retroAudio.playInteract();
              onOpenTerminal(t.scenarioId);
            }
          });
        }
        return;
      }
    }

    if (Math.hypot(tileX - level.exitX, tileY - level.exitY) < 1.4) {
      if (canLeaveRoom(level, progress, simRef.current.bots.filter((bot) => !bot.destroyed).length)) {
        walkTo(level.exitX, level.exitY, () => {
          retroAudio.playInteract();
          onReachExit();
        });
      }
      return;
    }

    walkTo(Math.max(1, Math.min(GRID_COLS - 2, Math.floor(tileX))),
      Math.max(2, Math.min(GRID_ROWS - 2, Math.floor(tileY))));
  };

  return (
    <div className="arena-shell">
      <div ref={arenaHost} className="arena-surface" />
    </div>
  );
}
