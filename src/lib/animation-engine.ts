export type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  color: string;
  life: number;
  maxLife: number;
};

export type WaveState = {
  amplitude: number;
  frequency: number;
  speed: number;
  phase: number;
};

export function createParticle(x: number, y: number, opts?: Partial<Particle>): Particle {
  return {
    x,
    y,
    vx: (Math.random() - 0.5) * 0.5,
    vy: (Math.random() - 0.5) * 0.3 - 0.2,
    size: Math.random() * 3 + 1,
    opacity: Math.random() * 0.6 + 0.2,
    color: opts?.color || 'rgba(45, 212, 191, 0.6)',
    life: Math.random() * 100 + 50,
    maxLife: Math.random() * 100 + 50,
    ...opts,
  };
}

export function updateParticle(p: Particle): Particle {
  p.x += p.vx;
  p.y += p.vy;
  p.life -= 1;
  p.opacity = Math.max(0, (p.life / p.maxLife) * 0.6);
  return p;
}

export function isParticleAlive(p: Particle): boolean {
  return p.life > 0 && p.y > -10;
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

export function easeInOutQuad(t: number): number {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

export function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

export function animateValue(
  el: HTMLElement | null,
  start: number,
  end: number,
  duration: number,
  onUpdate?: (val: number) => void
): void {
  if (!el) return;
  const startTime = performance.now();
  const step = (currentTime: number) => {
    const elapsed = currentTime - startTime;
    const t = Math.min(elapsed / duration, 1);
    const eased = easeOutCubic(t);
    const current = Math.round(lerp(start, end, eased));
    if (onUpdate) onUpdate(current);
    else el.textContent = String(current);
    if (t < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

export function createWaves(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  time: number,
  options?: { amplitude?: number; frequency?: number; speed?: number; yOffset?: number; color?: string }
): void {
  const amp = options?.amplitude ?? 30;
  const freq = options?.frequency ?? 0.01;
  const spd = options?.speed ?? 0.02;
  const yOff = options?.yOffset ?? height * 0.7;
  const color = options?.color || 'rgba(45, 212, 191, 0.15)';

  ctx.beginPath();
  ctx.moveTo(0, height);
  for (let x = 0; x <= width; x += 2) {
    const y = yOff + Math.sin(x * freq + time * spd) * amp + Math.sin(x * freq * 0.5 + time * spd * 0.7) * (amp * 0.5);
    ctx.lineTo(x, y);
  }
  ctx.lineTo(width, height);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
}

export function createGlow(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number, color: string): void {
  const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
  gradient.addColorStop(0, color);
  gradient.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
}

export class AnimationEngine {
  private rafId: number | null = null;
  private particles: Particle[] = [];
  private time: number = 0;
  private mouseX: number = 0;
  private mouseY: number = 0;
  private width: number = 0;
  private height: number = 0;

  constructor(
    private canvas: HTMLCanvasElement,
    private onFrame?: (ctx: CanvasRenderingContext2D, engine: AnimationEngine) => void,
    private particleCount: number = 60
  ) {
    this.resize();
    this.initParticles();
    this.loop();
    window.addEventListener('resize', () => this.resize());
    window.addEventListener('mousemove', (e) => {
      this.mouseX = e.clientX;
      this.mouseY = e.clientY;
    });
  }

  private initParticles(): void {
    this.particles = [];
    for (let i = 0; i < this.particleCount; i++) {
      this.particles.push(createParticle(
        Math.random() * this.width,
        Math.random() * this.height,
        { color: i % 3 === 0 ? 'rgba(45, 212, 191, 0.4)' : i % 3 === 1 ? 'rgba(16, 185, 129, 0.3)' : 'rgba(59, 130, 246, 0.2)' }
      ));
    }
  }

  private resize(): void {
    this.width = this.canvas.width = this.canvas.parentElement?.clientWidth || window.innerWidth;
    this.height = this.canvas.height = this.canvas.parentElement?.clientHeight || window.innerHeight;
  }

  private loop(): void {
    this.time += 0.016;
    const ctx = this.canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, this.width, this.height);

    this.particles = this.particles.filter(isParticleAlive);
    this.particles.forEach((p) => {
      const dx = this.mouseX - p.x;
      const dy = this.mouseY - p.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 150) {
        p.vx += (dx / dist) * 0.01;
        p.vy += (dy / dist) * 0.01;
      }
      p.vx *= 0.99;
      p.vy *= 0.99;
      updateParticle(p);
      ctx.globalAlpha = p.opacity;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, Math.max(0.5, p.size), 0, Math.PI * 2);
      ctx.fill();
    });

    if (this.particles.length < this.particleCount && Math.random() < 0.1) {
      this.particles.push(createParticle(
        Math.random() * this.width,
        this.height + 10,
        { color: Math.random() > 0.5 ? 'rgba(45, 212, 191, 0.4)' : 'rgba(59, 130, 246, 0.3)' }
      ));
    }

    if (this.onFrame) this.onFrame(ctx, this);
    this.rafId = requestAnimationFrame(() => this.loop());
  }

  public destroy(): void {
    if (this.rafId) cancelAnimationFrame(this.rafId);
  }

  public getTime(): number { return this.time; }
  public getMouse(): { x: number; y: number } { return { x: this.mouseX, y: this.mouseY }; }
}
