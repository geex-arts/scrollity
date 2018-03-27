import { NgZone } from '@angular/core';
import { Power4 } from 'gsap';

import { ScrollHandler } from '../handlers/scroll-handler';
import { ScrollSource } from './scroll-source.interface';

export class TouchScrollSource implements ScrollSource {

  touchStartListener: any;
  touchMoveListener: any;
  touchEndListener: any;
  lastTouch;
  touchMoves = [];
  dragging = false;

  constructor(private scrollHandler: ScrollHandler,
              private zone: NgZone) { }

  bind() {
    this.zone.runOutsideAngular(() => {
      this.touchStartListener = e => {
        return this.handleTouchStartEvent(e);
      };

      this.touchMoveListener = e => {
        return this.handleTouchMoveEvent(e);
      };

      this.touchEndListener = e => {
        return this.handleTouchEndEvent(e);
      };

      window.addEventListener('touchstart', this.touchStartListener);
      window.addEventListener('touchmove', this.touchMoveListener);
      window.addEventListener('touchend', this.touchEndListener);
      window.addEventListener('touchcancel', this.touchEndListener);
    });
  }

  unbind() {
    if (this.touchStartListener) {
      window.removeEventListener('touchstart', this.touchStartListener);
    }

    if (this.touchMoveListener) {
      window.removeEventListener('touchmove', this.touchEndListener);
    }

    if (this.touchEndListener) {
      window.removeEventListener('touchend', this.touchMoveListener);
      window.removeEventListener('touchcancel', this.touchMoveListener);
    }
  }

  handleTouchStartEvent(e) {
    if (!this.scrollHandler.handleAllowed) {
      return false;
    }

    e.stopPropagation();

    if (this.scrollHandler.animatingScroll) {
      return false;
    }

    this.lastTouch = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    this.touchMoves = [];
    this.dragging = true;

    return false;
  }

  handleTouchMoveEvent(e) {
    if (!this.scrollHandler.handleAllowed) {
      return false;
    }

    if (!this.dragging) {
      return false;
    }

    e.preventDefault();
    e.stopPropagation();

    if (this.scrollHandler.animatingScroll) {
      return false;
    }

    const touch = { x: e.touches[0].clientX, y: e.touches[0].clientY };

    if (this.lastTouch !== undefined) {
      const speed = this.scrollHandler.speed;

      const deltaX = Math.round(this.lastTouch.x - touch.x) * 2 * speed;
      const deltaY = Math.round(this.lastTouch.y - touch.y) * 2 * speed;

      this.scrollHandler.handleScrollEvent(e, deltaX, deltaY, 0, undefined);

      this.touchMoves.push({
        date: new Date(),
        deltaX: deltaX,
        deltaY: deltaY
      })
    }

    this.lastTouch = touch;
  }

  handleTouchEndEvent(e) {
    if (!this.scrollHandler.handleAllowed) {
      return false;
    }

    if (!this.dragging) {
      return false;
    }

    this.lastTouch = undefined;
    this.dragging = false;

    if (this.scrollHandler.animatingScroll) {
      return false;
    }

    this.handleTouchEndInertia(e, this.touchMoves);
  }

  handleTouchEndInertia(e, touches) {
    const a = 220; // duration
    const b = 0.1; // decrease
    const c = 7.5; // amplitude
    const ease = x => {
      if (x > a) {
        return 0;
      } else if (x <= 0) {
        return 1;
      } else {
        const f = (x, a, b) => (Math.acos(b * 2 / a * x - 1) / Math.PI);
        return c * f(x, a, 1) / f(x, a, b);
      }
    };

    const result = touches.map(item => {
      const now: any = new Date();
      const multiply = ease(now - item.date);

      return {
        deltaX: item.deltaX * multiply,
        deltaY: item.deltaY * multiply
      };
    }).reduce((sum, item) => {
      return {
        deltaX: sum.deltaX + item.deltaX,
        deltaY: sum.deltaY + item.deltaY
      };
    }, {
      deltaX: 0,
      deltaY: 0
    });

    const delta = Math.abs(result.deltaX) + Math.abs(result.deltaY);
    const duration = 0.16 * 3 * delta / 150;

    this.scrollHandler.handleScrollEvent(e, result.deltaX, result.deltaY, duration, Power4.easeOut);
  }

  onStickTo(position: number) { }
}
