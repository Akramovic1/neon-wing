import { GAME_CONFIG, COLORS, CANVAS_HEIGHT, CANVAS_WIDTH } from './constants';

interface Pipe {
  x: number;
  topHeight: number;
  passed: boolean;
}

export class PipeManager {
  pipes: Pipe[] = [];
  lastSpawn: number = 0;

  update(deltaTime: number, onScore: () => void) {
    this.lastSpawn += deltaTime;

    if (this.lastSpawn > GAME_CONFIG.PIPE_SPAWN_RATE) {
      this.spawnPipe();
      this.lastSpawn = 0;
    }

    this.pipes.forEach(pipe => {
      pipe.x -= GAME_CONFIG.PIPE_SPEED;
      
      if (!pipe.passed && pipe.x + GAME_CONFIG.PIPE_WIDTH < GAME_CONFIG.BIRD_X) {
        pipe.passed = true;
        onScore();
      }
    });

    this.pipes = this.pipes.filter(pipe => pipe.x + GAME_CONFIG.PIPE_WIDTH > -50);
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
    for (const pipe of this.pipes) {
      const withinX = GAME_CONFIG.BIRD_X + GAME_CONFIG.BIRD_SIZE > pipe.x && 
                     GAME_CONFIG.BIRD_X < pipe.x + GAME_CONFIG.PIPE_WIDTH;
      
      if (withinX) {
        const hitTop = playerY < pipe.topHeight;
        const hitBottom = playerY + GAME_CONFIG.BIRD_SIZE > pipe.topHeight + GAME_CONFIG.PIPE_GAP;
        if (hitTop || hitBottom) return true;
      }
    }

    if (playerY < 0 || playerY + GAME_CONFIG.BIRD_SIZE > CANVAS_HEIGHT) return true;
    
    return false;
  }

  draw(ctx: CanvasRenderingContext2D) {
    this.pipes.forEach(pipe => {
      ctx.shadowBlur = 10;
      ctx.shadowColor = COLORS.SECONDARY;
      ctx.fillStyle = COLORS.SURFACE;
      ctx.strokeStyle = COLORS.SECONDARY;
      ctx.lineWidth = 2;

      // Top Pipe
      ctx.fillRect(pipe.x, 0, GAME_CONFIG.PIPE_WIDTH, pipe.topHeight);
      ctx.strokeRect(pipe.x, 0, GAME_CONFIG.PIPE_WIDTH, pipe.topHeight);

      // Bottom Pipe
      const bottomY = pipe.topHeight + GAME_CONFIG.PIPE_GAP;
      const bottomHeight = CANVAS_HEIGHT - bottomY;
      ctx.fillRect(pipe.x, bottomY, GAME_CONFIG.PIPE_WIDTH, bottomHeight);
      ctx.strokeRect(pipe.x, bottomY, GAME_CONFIG.PIPE_WIDTH, bottomHeight);
    });
  }
}
