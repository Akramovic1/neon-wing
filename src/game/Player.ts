import { GAME_CONFIG } from './constants';
import { BirdConfig } from './types';

export class Player {
  y: number;
  velocity: number;
  rotation: number;
  nickname: string;
  config: BirdConfig;
  private wingFlap: number = 0;
  private flapSpeed: number = 0.12;
  private particles: {x: number, y: number, life: number, size: number}[] = [];

  constructor(config: BirdConfig, nickname: string) {
    this.y = 300;
    this.velocity = 0;
    this.rotation = 0;
    this.config = config;
    this.nickname = nickname || 'UNKNOWN PILOT';
  }

  jump() {
    this.velocity = GAME_CONFIG.JUMP_STRENGTH;
    this.flapSpeed = 0.8;
  }

  update() {
    this.velocity += GAME_CONFIG.GRAVITY;
    this.y += this.velocity;
    
    this.wingFlap += this.flapSpeed;
    this.flapSpeed += (0.15 - this.flapSpeed) * 0.1;
    
    const targetRotation = Math.min(Math.PI / 4, Math.max(-Math.PI / 4, this.velocity * 0.08));
    this.rotation += (targetRotation - this.rotation) * 0.15;

    if (Math.random() > 0.4) {
      this.particles.push({
        x: GAME_CONFIG.BIRD_X - 5,
        y: this.y + GAME_CONFIG.BIRD_SIZE / 2 + (Math.random() * 10 - 5),
        life: 1.0,
        size: Math.random() * 3 + 1
      });
    }
    this.particles = this.particles.filter(p => {
      p.x -= 3;
      p.life -= 0.04;
      return p.life > 0;
    });
  }

  private drawSegment(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x, y - h/2);
    ctx.lineTo(x + w, y - h/4);
    ctx.lineTo(x + w, y + h/4);
    ctx.lineTo(x, y + h/2);
    ctx.closePath();
    ctx.fill();
  }

  draw(ctx: CanvasRenderingContext2D) {
    const size = GAME_CONFIG.BIRD_SIZE;
    const flap = Math.sin(this.wingFlap);

    // 1. ENGINE TRAIL
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    this.particles.forEach(p => {
      ctx.fillStyle = `${this.config.secondaryColor}${Math.floor(p.life * 200).toString(16).padStart(2, '0')}`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();

    ctx.save();
    ctx.translate(GAME_CONFIG.BIRD_X + size / 2, this.y + size / 2);
    
    // Draw Nickname above bird
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.font = 'bold 10px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(this.nickname.toUpperCase(), 0, -size - 10);

    ctx.rotate(this.rotation);

    // 2. WINGS
    ctx.fillStyle = this.config.accentColor;
    ctx.shadowBlur = 15;
    ctx.shadowColor = this.config.accentColor;
    
    for(let i = 0; i < 3; i++) {
      ctx.save();
      ctx.rotate(flap * 0.4 + (i * 0.2));
      ctx.beginPath();
      ctx.moveTo(-5, 0);
      ctx.quadraticCurveTo(-size, -size * 0.8, -size * 1.2, -size * 0.2);
      ctx.lineTo(-size * 0.8, 0);
      ctx.fill();
      ctx.restore();
    }

    // 3. MAIN CHASSIS
    ctx.shadowBlur = 10;
    ctx.shadowColor = this.config.primaryColor;
    this.drawSegment(ctx, -size/2, 0, size/3, size/2, this.config.primaryColor);
    this.drawSegment(ctx, -size/6, 0, size/3, size/1.5, this.config.primaryColor);
    
    ctx.beginPath();
    ctx.moveTo(size/6, -size/3);
    ctx.lineTo(size/2, -size/6);
    ctx.lineTo(size/1.5, 0);
    ctx.lineTo(size/2, size/6);
    ctx.lineTo(size/6, size/3);
    ctx.fill();

    // 4. ENERGY CORE
    const pulse = 1 + Math.sin(Date.now() * 0.01) * 0.2;
    ctx.shadowBlur = 20 * pulse;
    ctx.shadowColor = this.config.secondaryColor;
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(0, 0, size/5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}
