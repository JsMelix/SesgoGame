import { GRID_COLS, GRID_ROWS, TILE_SIZE as TILE } from '../data/levels';
import { LabLevelConfig } from '../types/game';

const districts = [
  { name: 'ARCHIVO DEL CAMPUS', motif: 'rails', panels: ['REGISTROS', 'BECAS', 'BIBLIOTECA'] },
  { name: 'CABINA DE ALERTAS', motif: 'grid', panels: ['CONTROL', 'ENFERMERÍA', 'VERIFICACIÓN'] },
  { name: 'ESTACIÓN DE ACCESO', motif: 'route', panels: ['ORIENTACIÓN', 'IDENTIDAD', 'ADMISIÓN'] },
  { name: 'FORJA DE DATOS', motif: 'vents', panels: ['MUESTRA', 'ETIQUETAS', 'ACCESO'] },
  { name: 'ANTENA CENTRAL', motif: 'core', panels: ['ANÁLISIS', 'IMAGEN', 'VOX-ZERO'] },
];

export function paintArena(ctx: CanvasRenderingContext2D, level: LabLevelConfig) {
  const { floorPrimary, floorSecondary, wallColor, wallTrimColor, accentColor } = level;
  const { name, motif, panels } = districts[level.id - 1];
  const { width, height } = ctx.canvas;

  function rect(x: number, y: number, w: number, h: number, color: string) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
  }

  function glow(x: number, y: number, radius: number, color: string) {
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
    gradient.addColorStop(0, color);
    gradient.addColorStop(1, 'transparent');
    ctx.fillStyle = gradient;
    ctx.fillRect(x - radius, y - radius, 2 * radius, 2 * radius);
  }

  rect(0, 0, width, height, wallTrimColor);
  for (let row = 2; row < GRID_ROWS - 1; row++) {
    for (let col = 1; col < GRID_COLS - 1; col++) {
      const x = col * TILE;
      const y = row * TILE;
      const variant = (col * 13 + row * 7) % 11;
      rect(x, y, TILE - 1, TILE - 1, variant < 3 ? floorSecondary : floorPrimary);
      rect(x + 1, y + 1, TILE - 3, 1, '#CADCFF17');
      rect(x + 1, y + 2, 1, TILE - 4, '#CADCFF0D');
      if (variant % 3 === 0) {
        rect(x + 4, y + 16, 2, 2, '#ADC4DF27');
        rect(x + 18, y + 5, 2, 2, '#ADC4DF27');
        rect(x + 7, y + 20, variant + 3, 1, '#01030A70');
      }

      if (motif === 'rails' && (row === 4 || row === 11)) {
        rect(x, y + 8, TILE, 10, '#080D18');
        rect(x, y + 10, TILE, 1, '#8E632E');
        rect(x, y + 15, TILE, 1, '#8E632E');
        rect(x + 4, y + 12, 12, 2, '#324157');
      } else if (motif === 'grid' && (row % 4 === 0 || col % 6 === 0)) {
        rect(x, y + 11, TILE, 1, '#3E85A475');
        rect(x + 10, y + 9, 4, 5, '#66D9FF35');
      } else if (motif === 'route' && (col === 7 || col === 18 || row === 8)) {
        rect(x + 7, y + 7, 10, 10, '#A24B812C');
        rect(x + 10, y + 10, 4, 4, '#F8A0D85A');
      } else if (motif === 'vents' && variant < 3) {
        rect(x + 3, y + 5, 18, 14, '#07131A');
        for (let slot = 6; slot < 19; slot += 3) rect(x + slot, y + 7, 1, 10, '#478C7F');
      } else if (motif === 'core' && (col === 11 || col === 13 || row === 5)) {
        rect(x, y + 9, TILE, 6, '#71334C62');
        rect(x + 5, y + 11, 14, 2, '#FF738650');
      }
    }
  }

  const shade = ctx.createLinearGradient(0, 36, 0, height);
  shade.addColorStop(0, '#03081224');
  shade.addColorStop(0.4, 'transparent');
  shade.addColorStop(1, '#03081280');
  ctx.fillStyle = shade;
  ctx.fillRect(0, 40, width, height - 40);

  for (const terminal of level.terminals) {
    const x = terminal.tileX * TILE;
    const y = terminal.tileY * TILE;
    glow(x + 12, y + 12, 43, accentColor + '40');
    rect(x - 5, y - 4, 34, 34, '#08101D');
    rect(x - 3, y - 2, 30, 30, level.floorSecondary);
    rect(x - 3, y + 25, 30, 2, accentColor);
    rect(x - 5, y + 20, 2, 7, accentColor);
    rect(x + 27, y + 20, 2, 7, accentColor);
  }

  rect(0, 0, width, 43, '#0B1424');
  rect(0, 3, width, 2, '#4F6078');
  rect(0, 37, width, 4, wallColor);
  rect(0, 41, width, 3, '#000611');
  rect(20, 9, 2, 21, accentColor);
  ctx.font = 'bold 13px monospace';
  ctx.textAlign = 'left';
  rect(27, 11, 2, 2, accentColor);
  ctx.fillStyle = '#DDEAFF';
  ctx.fillText(name, 27, 24);
  rect(27, 28, 124, 1, '#6385A9');

  panels.forEach((panel, index) => {
    const x = 242 + index * 114;
    rect(x, 8, 103, 24, '#030817');
    rect(x + 1, 9, 101, 22, floorSecondary);
    rect(x + 1, 9, 100, 1, accentColor);
    rect(x + 5, 14, 3, 3, '#E0FAFF');
    ctx.font = 'bold 7px monospace';
    ctx.fillStyle = '#C7D6ED';
    ctx.fillText(panel, x + 12, 19);
    for (let bar = 0; bar < 8; bar++) {
      const length = 2 + ((bar * 3 + index * 2 + level.id) % 6);
      rect(x + 12 + bar * 9, 29 - length, 6, length, accentColor + '70');
    }
  });

  for (let col = 0; col < GRID_COLS; col++) {
    rect(col * TILE, height - TILE, TILE - 1, TILE, wallColor);
    rect(col * TILE + 2, height - TILE + 3, TILE - 5, 2, '#465A77');
    rect(col * TILE + 3, height - TILE + 10, TILE - 7, 7, '#070E1B');
    if (col % 4 === 0) rect(col * TILE + 5, height - TILE + 12, 7, 2, accentColor);
  }
  for (let row = 2; row < GRID_ROWS - 1; row++) {
    const y = row * TILE;
    rect(10, y, 5, TILE - 1, wallColor);
    rect(width - 15, y, 5, TILE - 1, wallColor);
    if (row % 3 === 0) {
      glow(16, y + 12, 38, accentColor + '37');
      glow(width - 16, y + 12, 38, accentColor + '37');
      rect(10, y + 8, 4, 7, accentColor);
      rect(width - 14, y + 8, 4, 7, accentColor);
    }
  }
}
