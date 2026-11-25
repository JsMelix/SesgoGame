import Phaser from 'phaser';
import { renderLabScene, RenderState } from '../components/pixelRenderer';
import { GRID_COLS, GRID_ROWS, TILE_SIZE } from '../data/levels';
import { LabLevelConfig } from '../types/game';
import { paintArena } from './arenaArt';

interface ArenaSize {
  w: number;
  h: number;
}

export class ArenaScene extends Phaser.Scene {
  private overlay!: Phaser.Textures.CanvasTexture;
  private overlayImage!: Phaser.GameObjects.Image;
  private beaconRings!: Phaser.GameObjects.Graphics;

  constructor(
    private readonly level: LabLevelConfig,
    private readonly size: ArenaSize,
    private readonly frame: (scene: ArenaScene, time: number, delta: number) => void,
    private readonly tap: (worldX: number, worldY: number) => void,
  ) {
    super('arena');
  }

  create() {
    const terrain = this.textures.createCanvas('arena-floor', GRID_COLS * TILE_SIZE, GRID_ROWS * TILE_SIZE);
    if (!terrain) throw new Error('No se pudo crear la textura del escenario.');
    paintArena(terrain.context, this.level);
    terrain.refresh();
    this.add.image(0, 0, terrain.key).setOrigin(0);

    this.beaconRings = this.add.graphics().setDepth(1);
    this.tweens.add({
      targets: this.beaconRings,
      alpha: { from: 0.55, to: 1 },
      duration: 850,
      yoyo: true,
      repeat: -1,
    });

    const actors = this.textures.createCanvas('arena-actors', this.size.w, this.size.h);
    if (!actors) throw new Error('No se pudo crear la capa de personajes.');
    this.overlay = actors;
    this.overlayImage = this.add.image(0, 0, this.overlay.key).setOrigin(0).setScrollFactor(0).setDepth(2);
    this.input.on('pointerup', (pointer: Phaser.Input.Pointer) => {
      const { x, y } = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
      this.tap(x, y);
    });
  }

  update(time: number, delta: number) {
    this.frame(this, time, delta);
  }

  present(state: RenderState, camX: number, camY: number, size: ArenaSize) {
    if (this.overlay.width !== size.w || this.overlay.height !== size.h) {
      this.scale.setGameSize(size.w, size.h);
      this.cameras.main.setSize(size.w, size.h);
      this.overlay.setSize(size.w, size.h);
      this.overlayImage.setSizeToFrame();
    }
    const cameraX = -Math.round(-camX + state.shakeOffset.x);
    const cameraY = -Math.round(-camY + state.shakeOffset.y);
    this.cameras.main.setScroll(cameraX, cameraY);

    const objective = state.objective;
    this.beaconRings.clear();
    if (objective) {
      const x = objective.x * TILE_SIZE + 12;
      const y = objective.y * TILE_SIZE + 12;
      this.beaconRings.lineStyle(1, objective.color, 0.72)
        .strokeCircle(x, y, 17)
        .strokeCircle(x, y, 21);
    }

    this.overlay.context.clearRect(0, 0, size.w, size.h);
    renderLabScene(this.overlay.context, state, camX, camY);
    this.overlay.refresh();
  }
}
