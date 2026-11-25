import { Direction } from '../types/game';

export const DASH_DURATION = 0.19;
export const DASH_COOLDOWN = 1.35;
export const DASH_SPEED = 13;
export const PARRY_WINDOW = 0.16;
export const PARRY_RADIUS = 1.65;
export const SENTINEL_SHOT_SPEED = 5.2;

export const directionVectors: Record<Direction, [number, number]> = {
  up: [0, -1],
  down: [0, 1],
  left: [-1, 0],
  right: [1, 0],
};

const SINGLE_SHOT = [0];
const BOSS_VOLLEY = [-0.23, 0, 0.23];
const BOSS_ENRAGED_VOLLEY = [-0.55, -0.28, 0, 0.28, 0.55];

export function sentinelSpread(isBoss: boolean, hp: number, maxHp: number) {
  if (!isBoss) return SINGLE_SHOT;
  return hp <= maxHp / 2 ? BOSS_ENRAGED_VOLLEY : BOSS_VOLLEY;
}
