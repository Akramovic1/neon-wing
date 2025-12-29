import { BirdConfig } from './types';
import { GAME_CONFIG } from './constants';

export class Player {
  public y: number;
  public velocity: number = 0;
  private config: BirdConfig;
  private nickname: string;
  private size: number = 30;
  private rotation: number = 0;
  private wingTimer: number = 0;

  constructor(config: BirdConfig, nickname: string) {
    this.config = config;
    this.nickname = nickname;
    this.y = 300;
  }

  jump() {
    this.velocity = GAME_CONFIG.JUMP_FORCE;
  }

  update() {
    this.velocity += GAME_CONFIG.GRAVITY;
    this.y += this.velocity;
    
    // Calculate rotation based on velocity
    this.rotation = Math.min(Math.PI / 4, Math.max(-Math.PI / 4, this.velocity * 0.1));
    
    // Wing animation timer
    this.wingTimer += 0.15;

    if (this.y < 0) {
      this.y = 0;
      this.velocity = 0;
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    
    // Position the bird
    ctx.translate(65, this.y + this.size / 2);
    ctx.rotate(this.rotation);

    // Draw Glow Effect
    ctx.shadowBlur = 20;
    ctx.shadowColor = this.config.primaryColor;

    const wingFlap = Math.sin(this.wingTimer) * 15;

    // Draw Wings based on type
    ctx.fillStyle = this.config.secondaryColor;
    ctx.beginPath();
    if (this.config.bodyType === 'heavy') {
      // Large broad wings
      ctx.moveTo(-10, 0);
      ctx.lineTo(-25, -20 + wingFlap);
      ctx.lineTo(0, -10);
      ctx.lineTo(25, -20 + wingFlap);
      ctx.lineTo(10, 0);
    } else if (this.config.bodyType === 'sharp') {
      // Pointy stealth wings
      ctx.moveTo(-5, 0);
      ctx.lineTo(-20, -25 + wingFlap);
      ctx.lineTo(5, 0);
      ctx.lineTo(20, -25 + wingFlap);
    } else {
      // Sleek phoenix wings
      ctx.moveTo(-15, 0);
      ctx.quadraticCurveTo(-20, -30 + wingFlap, 0, -5);
      ctx.quadraticCurveTo(20, -30 + wingFlap, 15, 0);
    }
    ctx.fill();

    // Draw Body
    ctx.fillStyle = this.config.primaryColor;
    ctx.beginPath();
    if (this.config.bodyType === 'heavy') {
      ctx.roundRect(-15, -10, 30, 20, 5);
    } else if (this.config.bodyType === 'sharp') {
      ctx.moveTo(-15, 0);
      ctx.lineTo(0, -12);
      ctx.lineTo(15, 0);
      ctx.lineTo(0, 12);
      ctx.closePath();
    } else {
      ctx.ellipse(0, 0, 18, 12, 0, 0, Math.PI * 2);
    }
    ctx.fill();

    // Draw Eye (Accent)
    ctx.fillStyle = this.config.accentColor;
    ctx.beginPath();
    ctx.arc(8, -2, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    // Draw Nickname (Static above the bird)
    ctx.save();
    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.font = 'bold 12px Inter';
    ctx.textAlign = 'center';
    ctx.fillText(this.nickname, 65, this.y - 25);
    ctx.restore();
  }
}
