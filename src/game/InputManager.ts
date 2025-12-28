export class InputManager {
  private isPressed: boolean = false;
  private listeners: (() => void)[] = [];

  constructor() {
    window.addEventListener('keydown', (e) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        this.trigger();
      }
    });
    window.addEventListener('touchstart', () => this.trigger());
    window.addEventListener('mousedown', () => this.trigger());
  }

  private trigger() {
    this.isPressed = true;
    this.listeners.forEach(callback => callback());
  }

  onJump(callback: () => void) {
    this.listeners.push(callback);
  }

  consumePress(): boolean {
    const pressed = this.isPressed;
    this.isPressed = false;
    return pressed;
  }
}
