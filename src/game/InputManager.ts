export class InputManager {
  private jumpCallback: () => void = () => {};

  constructor() {
    window.addEventListener('keydown', (e) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        this.jumpCallback();
      }
    });

    window.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this.jumpCallback();
    }, { passive: false });

    window.addEventListener('mousedown', () => {
      this.jumpCallback();
    });
  }

  onJump(callback: () => void) {
    this.jumpCallback = callback;
  }
}
