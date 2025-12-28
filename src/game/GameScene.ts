import { Player } from './Player';
import { PipeManager } from './PipeManager';
import { InputManager } from './InputManager';
import { CANVAS_WIDTH, CANVAS_HEIGHT, COLORS } from './constants';
import { BirdConfig } from './types';

export class GameScene {
  private ctx: CanvasRenderingContext2D;
  private player: Player;
  private pipeManager: PipeManager;
  private inputManager: InputManager;
  private score: number = 0;
  private isGameOver: boolean = false;
  private onGameOverCallback: (score: number) => void;
  private onScoreCallback: (score: number) => void;
  private lastTime: number = 0;

  constructor(
    canvas: HTMLCanvasElement, 
    birdConfig: BirdConfig,
    nickname: string,
    onGameOver: (score: number) => void,
    onScore: (score: number) => void
  ) {
    this.ctx = canvas.getContext('2d')!;
    this.player = new Player(birdConfig, nickname);
    this.pipeManager = new PipeManager();
    this.inputManager = new InputManager();
    this.onGameOverCallback = onGameOver;
    this.onScoreCallback = onScore;

    this.inputManager.onJump(() => {
      if (!this.isGameOver) this.player.jump();
    });
  }

  update(timestamp: number) {
    if (this.isGameOver) return;
    const deltaTime = timestamp - this.lastTime;
    this.lastTime = timestamp;

    this.player.update();
    this.pipeManager.update(deltaTime, () => {
      this.score++;
      this.onScoreCallback(this.score);
    });

    if (this.pipeManager.checkCollision(this.player.y)) {
      this.isGameOver = true;
      this.onGameOverCallback(this.score);
    }
  }

  draw() {
    this.ctx.fillStyle = COLORS.BACKGROUND;
    this.ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    this.ctx.strokeStyle = '#222';
    this.ctx.lineWidth = 1;
    for(let i=0; i<CANVAS_WIDTH; i+=40) {
      this.ctx.beginPath();
      this.ctx.moveTo(i, 0);
      this.ctx.lineTo(i, CANVAS_HEIGHT);
      this.ctx.stroke();
    }

    this.pipeManager.draw(this.ctx);
    this.player.draw(this.ctx);
  }
}
