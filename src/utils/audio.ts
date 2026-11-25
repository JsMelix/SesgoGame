class HeavyMetalAudioEngine {
  private ctx: AudioContext | null = null;
  private distortionNode: WaveShaperNode | null = null;
  private muted: boolean = false;
  private lastStepAt: number = 0;

  setMuted(muted: boolean) {
    this.muted = muted;
  }

  isMuted(): boolean {
    return this.muted;
  }

  private createDistortionCurve(amount = 35): Float32Array<ArrayBuffer> {
    const samples = 256;
    const buffer = new ArrayBuffer(samples * 4);
    const curve = new Float32Array(buffer);
    const deg = Math.PI / 180;
    for (let i = 0; i < samples; i++) {
      const x = (i * 2) / samples - 1;
      curve[i] = ((3 + amount) * x * 20 * deg) / (Math.PI + amount * Math.abs(x));
    }
    return curve;
  }

  private ensureContext(): AudioContext | null {
    if (this.muted || typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.distortionNode = this.ctx.createWaveShaper();
        this.distortionNode.curve = this.createDistortionCurve(28);
        this.distortionNode.oversample = '2x';
        this.distortionNode.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  private playTone(
    freq: number,
    duration: number,
    type: OscillatorType = 'sawtooth',
    gainLevel = 0.035,
    delay = 0,
    endFreq?: number,
    overdrive = false
  ) {
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    if (endFreq !== undefined) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(40, endFreq), now + duration);
    }

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(gainLevel, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(gain);
    if (overdrive && this.distortionNode) {
      gain.connect(this.distortionNode);
    } else {
      gain.connect(ctx.destination);
    }

    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  private playPowerChord(rootHz: number, duration: number, delay = 0, gainLevel = 0.028) {
    this.playTone(rootHz, duration, 'sawtooth', gainLevel, delay, undefined, true);
    this.playTone(rootHz * 1.498, duration, 'square', gainLevel * 0.8, delay, undefined, true);
  }

  playStep() {
    const now = performance.now();
    if (now - this.lastStepAt < 175) return;
    this.lastStepAt = now;
    this.playTone(135, 0.04, 'triangle', 0.02, 0, 90);
  }

  playUiClick() {
    this.playTone(480, 0.05, 'square', 0.022, 0, 620);
  }

  playInteract() {
    this.playPowerChord(220, 0.08, 0, 0.022);
    this.playPowerChord(293.66, 0.1, 0.06, 0.025);
  }

  playPulseZap() {
    this.playTone(680, 0.14, 'sawtooth', 0.038, 0, 140, true);
    this.playTone(980, 0.12, 'square', 0.025, 0.03, 210, true);
  }

  playEnemyHit() {
    this.playTone(320, 0.07, 'square', 0.032, 0, 180, true);
  }

  playEnemyDestroy() {
    this.playPowerChord(196.0, 0.1, 0, 0.035);
    this.playTone(120, 0.2, 'sawtooth', 0.04, 0.04, 48, true);
  }

  playShieldDown() {
    this.playTone(440, 0.08, 'triangle', 0.035, 0);
    this.playTone(659.25, 0.09, 'triangle', 0.035, 0.07);
    this.playTone(880, 0.14, 'square', 0.03, 0.14);
  }

  playPickup() {
    this.playTone(587.33, 0.06, 'triangle', 0.035, 0);
    this.playTone(880, 0.1, 'triangle', 0.035, 0.05);
  }

  playKeyPickup() {
    this.playTone(659.25, 0.07, 'square', 0.028, 0);
    this.playTone(880, 0.07, 'square', 0.028, 0.06);
    this.playTone(1318.5, 0.14, 'triangle', 0.035, 0.12);
  }

  playChestOpen() {
    this.playPowerChord(220, 0.09, 0, 0.03);
    this.playPowerChord(293.66, 0.09, 0.08, 0.03);
    this.playPowerChord(440, 0.18, 0.16, 0.035);
  }

  playGateUnlock() {
    this.playPowerChord(146.83, 0.12, 0, 0.034);
    this.playTone(523.25, 0.09, 'square', 0.028, 0.07);
    this.playTone(783.99, 0.16, 'triangle', 0.035, 0.14);
  }

  playSwitchFlip() {
    this.playTone(392, 0.06, 'square', 0.03, 0);
    this.playTone(587.33, 0.11, 'square', 0.03, 0.05);
  }

  playOverdrive() {
    this.playPowerChord(164.81, 0.08, 0, 0.034);
    this.playPowerChord(246.94, 0.08, 0.07, 0.034);
    this.playPowerChord(329.63, 0.22, 0.14, 0.038);
  }

  playBotHit() {
    this.playTone(150, 0.18, 'sawtooth', 0.045, 0, 65, true);
  }

  playHint() {
    this.playTone(587.33, 0.08, 'triangle', 0.035, 0);
    this.playTone(880, 0.12, 'triangle', 0.035, 0.08);
  }

  playSuccess() {
    // Heavy metal E5 -> G5 -> A5 -> B5 victory riff
    this.playPowerChord(164.81, 0.1, 0, 0.03);
    this.playPowerChord(196.0, 0.1, 0.09, 0.03);
    this.playPowerChord(220.0, 0.1, 0.18, 0.03);
    this.playPowerChord(246.94, 0.25, 0.27, 0.035);
  }

  playError() {
    // Tritone heavy metal buzzer
    this.playTone(146.83, 0.14, 'sawtooth', 0.035, 0, 110, true);
    this.playTone(207.65, 0.18, 'sawtooth', 0.03, 0.08, 130, true);
  }

  playLevelUnlock() {
    const roots = [164.81, 196.0, 220.0, 246.94, 329.63];
    roots.forEach((hz, idx) => {
      this.playPowerChord(hz, idx === roots.length - 1 ? 0.34 : 0.11, idx * 0.09, 0.034);
    });
  }
}

export const retroAudio = new HeavyMetalAudioEngine();
