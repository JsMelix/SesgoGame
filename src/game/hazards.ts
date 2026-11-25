export function circuitPhase(time: number, offset: number): 'rest' | 'warning' | 'live' {
  const cycle = (time + offset) % 3.2;
  if (cycle < 1.8) return 'rest';
  return cycle < 2.5 ? 'warning' : 'live';
}
