import { FIELD_TESTS } from '../data/fieldTests';
import { GateConfig, LabLevelConfig, PlayerProgress } from '../types/game';

const emptyRecord: PlayerProgress['fieldwork'][number] = { sources: [], applied: false };

export function fieldRecord(progress: PlayerProgress, levelId: number) {
  return progress.fieldwork[levelId] ?? emptyRecord;
}

const sitesByLevel = Object.fromEntries(Object.entries(FIELD_TESTS).map(([id, test]) => [
  id, [...test.sources, { ...test.console, id: 'console' as const }],
]));

export function fieldSites(levelId: number) {
  return sitesByLevel[levelId];
}

export function gateIsOpen(gate: GateConfig, opened: Record<string, boolean>, fieldApplied: boolean) {
  return gate.requiresFieldTest ? fieldApplied : Boolean(opened[gate.id]);
}

export function canLeaveRoom(level: LabLevelConfig, progress: PlayerProgress, enemiesRemaining: number) {
  return enemiesRemaining === 0 && fieldRecord(progress, level.id).applied &&
    level.terminals.every((terminal) => progress.scenarios[terminal.scenarioId]?.solved);
}
