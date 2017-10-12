import { NgZone } from '@angular/core';

import { ScrollHandler } from './scroll-handler';
import { ScrollSourceHandler } from './scroll-source-handler';

export class TouchScrollSourceHandler implements ScrollSourceHandler {

  touchStartListener: any;
  touchMoveListener: any;
  touchEndListener: any;
  lastTouch;
  touchMoves = [];

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

      this.touchEndListener = () => {
        return this.handleTouchEndEvent();
      };

      document.body.addEventListener('touchstart', this.touchStartListener);
      document.body.addEventListener('touchmove', this.touchMoveListener);
      document.body.addEventListener('touchend', this.touchEndListener);
    });
  }

  unbind() {
    if (this.touchStartListener) {
      document.body.removeEventListener('touchstart', this.touchStartListener);
    }

    if (this.touchMoveListener) {
      document.body.removeEventListener('touchend', this.touchMoveListener);
    }

    if (this.touchEndListener) {
      document.body.removeEventListener('touchmove', this.touchEndListener);
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

    return false;
  }

  handleTouchMoveEvent(e) {
    if (!this.scrollHandler.handleAllowed) {
      return false;
    }

    e.preventDefault();
    e.stopPropagation();

    if (this.scrollHandler.animatingScroll) {
      return false;
    }

    const touch = { x: e.touches[0].clientX, y: e.touches[0].clientY };

    if (this.lastTouch !== undefined) {
      const speed = 1;

      const deltaX = Math.round(this.lastTouch.x - touch.x) * speed;
      const deltaY = Math.round(this.lastTouch.y - touch.y) * speed;

      if (this.scrollHandler._scrollMap) {
        this.scrollHandler.handleScrollMapScrollEvent(deltaX, deltaY, 0);
      } else {
        this.scrollHandler.handleDefaultScrollEvent(deltaX, deltaY, 0);
      }

      this.touchMoves.push({
        date: new Date(),
        deltaX: deltaX,
        deltaY: deltaY
      })
    }

    this.lastTouch = touch;
  }

  handleTouchEndEvent() {
    if (!this.scrollHandler.handleAllowed) {
      return false;
    }

    this.lastTouch = undefined;

    if (this.scrollHandler.animatingScroll) {
      return false;
    }

    this.handleTouchEndInertia(this.touchMoves);
  }

  handleTouchEndInertia(touches) {
    const a = 220; // duration
    const b = 0.1; // decrease
    const c = 5; // amplitude
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

    if (this.scrollHandler._scrollMap) {
      this.scrollHandler.handleScrollMapScrollEvent(result.deltaX, result.deltaY, 0.1 * 3);
    } else {
      this.scrollHandler.handleDefaultScrollEvent(result.deltaX, result.deltaY, 0.16 * 3);
    }
  }

  onStickTo(position: number) { }
}
