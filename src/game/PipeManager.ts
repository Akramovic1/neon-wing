import { CANVAS_WIDTH, CANVAS_HEIGHT, GAME_CONFIG, COLORS } from './constants';

export class PipeManager {
  private pipes: any[] = [];
  private timer: number = 0;

  update(deltaTime: number, onScore: () => void) {
    this.timer += deltaTime;

    if (this.timer > GAME_CONFIG.PIPE_SPAWN_RATE) {
      this.spawnPipe();
      this.timer = 0;
    }

    for (let i = this.pipes.length - 1; i >= 0; i--) {
      const pipe = this.pipes[i];
      pipe.x -= GAME_CONFIG.PIPE_SPEED;

      if (!pipe.passed && pipe.x < 50) {
        pipe.passed = true;
        onScore();
      }

      if (pipe.x + 60 < 0) {
        this.pipes.splice(i, 1);
      }
    }
  }

  private spawnPipe() {
    const minHeight = 50;
    const maxHeight = CANVAS_HEIGHT - GAME_CONFIG.PIPE_GAP - minHeight;
    const topHeight = Math.floor(Math.random() * (maxHeight - minHeight + 1)) + minHeight;

    this.pipes.push({
      x: CANVAS_WIDTH,
      topHeight,
      passed: false
    });
  }

  checkCollision(playerY: number): boolean {
    const birdX = 65;
    const birdSize = 20;

    for (const pipe of this.pipes) {
      if (birdX + birdSize > pipe.x && birdX < pipe.x + 60) {
        if (playerY < pipe.topHeight || playerY + birdSize > pipe.topHeight + GAME_CONFIG.PIPE_GAP) {
          return true;
        }
      }
    }

    if (playerY + birdSize > CANVAS_HEIGHT) return true;
    return false;
  }

  draw(ctx: CanvasRenderingContext2D) {
    this.pipes.forEach(pipe => {
      ctx.save();
      ctx.shadowBlur = 15;
      ctx.shadowColor = COLORS.PIPE_GLOW;
      ctx.fillStyle = COLORS.PIPE;
      
      // Top Pipe
      ctx.fillRect(pipe.x, 0, 60, pipe.topHeight);
      // Bottom Pipe
      ctx.fillRect(pipe.x, pipe.topHeight + GAME_CONFIG.PIPE_GAP, 60, CANVAS_HEIGHT);
      
      // Pipe Caps
      ctx.fillStyle = COLORS.PRIMARY;
      ctx.fillRect(pipe.x - 2, pipe.topHeight - 10, 64, 10);
      ctx.fillRect(pipe.x - 2, pipe.topHeight + GAME_CONFIG.PIPE_GAP, 64, 10);
      
      ctx.restore();
    });
  }
}
