export type GameScreen = 'TITLE_MENU' | 'PLAYING' | 'PAUSED' | 'LEVEL_COMPLETE' | 'VICTORY';

export type Direction = 'down' | 'up' | 'left' | 'right';

export type EnemyKind = 'noise_drone' | 'echo_bot' | 'vox_sentinel';

export type KeyColor = 'gold' | 'crimson' | 'cyan';

export interface BiasDefinition {
  id: string;
  name: string;
  levelId: number;
  summary: string;
  warningSignal: string;
  mitigation: string;
}

export interface EnemyLore {
  kind: EnemyKind;
  name: string;
  threatMetaphor: string;
  behavior: string;
  counterTip: string;
}

export interface ScenarioOption {
  id: string;
  label: string;
  isCorrect: boolean;
  feedback: string;
}

export interface Scenario {
  id: string;
  levelId: number;
  terminalNumber: 1 | 2 | 3;
  biasId: string;
  biasName: string;
  title: string;
  npcName: string;
  npcRole: string;
  npcGreeting: string;
  scenarioText: string;
  evidenceTitle: string;
  evidenceItems: Array<{ label: string; value: string }>;
  socraticHints: [string, string];
  lumenReflection: string;
  options: [ScenarioOption, ScenarioOption, ScenarioOption, ScenarioOption];
  mitigationPrinciple: string;
  realWorldConnection: string;
}

export interface TerminalNode {
  scenarioId: string;
  terminalNumber: 1 | 2 | 3;
  tileX: number;
  tileY: number;
  npcTileX: number;
  npcTileY: number;
  npcShirtColor: string;
  npcHairColor: string;
  npcSkinColor: string;
  npcStyle: 'glasses' | 'ponytail' | 'beanie' | 'labcoat';
}

export interface GlitchBotConfig {
  id: string;
  kind: EnemyKind;
  linkedScenarioId?: string;
  dropsKeyColor?: KeyColor;
  dropsKeyLabel?: string;
  waypoints: Array<{ x: number; y: number }>;
  speed: number;
  maxHp: number;
}

export interface WallBlock {
  tileX: number;
  tileY: number;
  widthTiles: number;
  heightTiles: number;
}

export interface GateConfig {
  id: string;
  tileX: number;
  tileY: number;
  widthTiles: number;
  heightTiles: number;
  keyColor?: KeyColor;
  keyLabel?: string;
  requiresSwitchId?: string;
}

export interface ChestConfig {
  id: string;
  tileX: number;
  tileY: number;
  rewardType: 'key' | 'overdrive' | 'heal';
  keyColor?: KeyColor;
  keyLabel?: string;
}

export interface SwitchConfig {
  id: string;
  tileX: number;
  tileY: number;
  label: string;
}

export interface FurnitureItem {
  kind: 'desk' | 'rack' | 'plant' | 'bookshelf' | 'whiteboard' | 'table' | 'amp' | 'tesla' | 'poster';
  tileX: number;
  tileY: number;
  widthTiles: number;
  heightTiles: number;
}

export interface LabLevelConfig {
  id: number;
  title: string;
  subtitle: string;
  difficultyLabel: string;
  biasesCovered: string[];
  floorPrimary: string;
  floorSecondary: string;
  wallColor: string;
  wallTrimColor: string;
  accentColor: string;
  spawnX: number;
  spawnY: number;
  exitX: number;
  exitY: number;
  walls: WallBlock[];
  gates: GateConfig[];
  chests: ChestConfig[];
  switches: SwitchConfig[];
  terminals: [TerminalNode, TerminalNode, TerminalNode];
  bots: GlitchBotConfig[];
  furniture: FurnitureItem[];
  ambientQuote: string;
}

export interface ScenarioProgress {
  solved: boolean;
  attempts: number;
  usedHints: number;
}

export interface PlayerProgress {
  unlockedLevel: number;
  scenarios: Record<string, ScenarioProgress>;
  soundMuted: boolean;
}
