export type InputAction = 'LEFT' | 'RIGHT' | 'JUMP' | 'SLIDE';

export class InputController {
  private onActionCallback: (action: InputAction) => void;
  private touchStartX: number = 0;
  private touchStartY: number = 0;
  private minSwipeDistance: number = 30; // px
  private active: boolean = false;

  private boundKeyDown: (e: KeyboardEvent) => void;
  private boundTouchStart: (e: TouchEvent) => void;
  private boundTouchEnd: (e: TouchEvent) => void;
  private boundMouseDown: (e: MouseEvent) => void;
  private boundMouseUp: (e: MouseEvent) => void;

  constructor(onAction: (action: InputAction) => void) {
    this.onActionCallback = onAction;

    this.boundKeyDown = this.handleKeyDown.bind(this);
    this.boundTouchStart = this.handleTouchStart.bind(this);
    this.boundTouchEnd = this.handleTouchEnd.bind(this);
    this.boundMouseDown = this.handleMouseDown.bind(this);
    this.boundMouseUp = this.handleMouseUp.bind(this);
  }

  public attach(domElement: HTMLElement | Window = window) {
    if (this.active) return;
    this.active = true;

    window.addEventListener('keydown', this.boundKeyDown, { passive: false });
    domElement.addEventListener('touchstart', this.boundTouchStart as EventListener, { passive: true });
    domElement.addEventListener('touchend', this.boundTouchEnd as EventListener, { passive: true });
    domElement.addEventListener('mousedown', this.boundMouseDown as EventListener, { passive: true });
    domElement.addEventListener('mouseup', this.boundMouseUp as EventListener, { passive: true });
  }

  public detach(domElement: HTMLElement | Window = window) {
    if (!this.active) return;
    this.active = false;

    window.removeEventListener('keydown', this.boundKeyDown);
    domElement.removeEventListener('touchstart', this.boundTouchStart as EventListener);
    domElement.removeEventListener('touchend', this.boundTouchEnd as EventListener);
    domElement.removeEventListener('mousedown', this.boundMouseDown as EventListener);
    domElement.removeEventListener('mouseup', this.boundMouseUp as EventListener);
  }

  private handleKeyDown(e: KeyboardEvent) {
    if (!this.active) return;

    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
      e.preventDefault();
      this.onActionCallback('LEFT');
    } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
      e.preventDefault();
      this.onActionCallback('RIGHT');
    } else if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W' || e.key === ' ') {
      e.preventDefault();
      this.onActionCallback('JUMP');
    } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
      e.preventDefault();
      this.onActionCallback('SLIDE');
    }
  }

  private handleTouchStart(e: TouchEvent) {
    if (e.touches.length > 0) {
      this.touchStartX = e.touches[0].clientX;
      this.touchStartY = e.touches[0].clientY;
    }
  }

  private handleTouchEnd(e: TouchEvent) {
    if (!this.active || e.changedTouches.length === 0) return;

    const deltaX = e.changedTouches[0].clientX - this.touchStartX;
    const deltaY = e.changedTouches[0].clientY - this.touchStartY;
    this.processSwipe(deltaX, deltaY);
  }

  private handleMouseDown(e: MouseEvent) {
    this.touchStartX = e.clientX;
    this.touchStartY = e.clientY;
  }

  private handleMouseUp(e: MouseEvent) {
    if (!this.active) return;
    const deltaX = e.clientX - this.touchStartX;
    const deltaY = e.clientY - this.touchStartY;
    this.processSwipe(deltaX, deltaY);
  }

  private processSwipe(deltaX: number, deltaY: number) {
    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);

    if (Math.max(absX, absY) < this.minSwipeDistance) return;

    if (absX > absY) {
      // Horizontal swipe
      if (deltaX > 0) {
        this.onActionCallback('RIGHT');
      } else {
        this.onActionCallback('LEFT');
      }
    } else {
      // Vertical swipe
      if (deltaY < 0) {
        this.onActionCallback('JUMP'); // Swipe up
      } else {
        this.onActionCallback('SLIDE'); // Swipe down
      }
    }
  }
}
