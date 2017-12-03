import { NgZone } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { Subject } from 'rxjs/Subject';

import { ScrollHandler } from '../handlers/scroll-handler';
import { ScrollSource } from './scroll-source.interface';

export class WheelScrollSource implements ScrollSource {

  mouseWheelListener: any;
  subscriptions: Subscription[] = [];
  wheelEventReleased = new Subject<any>();
  wheelEventCaptured = false;

  constructor(private scrollHandler: ScrollHandler,
              private zone: NgZone) { }

  bind() {
    this.subscriptions.push(this.wheelEventReleased.debounceTime(600).subscribe(() => this.handleWheelReleaseEvent()));

    this.zone.runOutsideAngular(() => {
      if (this.mouseWheelListener) {
        return;
      }

      this.mouseWheelListener = e => {
        return this.handleWheelEvent(e);
      };

      document.body.addEventListener('wheel', this.mouseWheelListener);
    });
  }

  unbind() {
    this.subscriptions.forEach(item => item.unsubscribe());

    if (this.mouseWheelListener) {
      document.body.removeEventListener('wheel', this.mouseWheelListener);
    }
  }

  handleWheelEvent(e) {
    if (!this.scrollHandler.handleAllowed) {
      e.preventDefault();
      return false;
    }

    e.preventDefault();
    e.stopPropagation();

    if (this.wheelEventCaptured) {
      if (this.scrollHandler.animatingScroll) {
        this.wheelEventReleased.next(e);
      }

      return;
    }

    if (this.scrollHandler.animatingScroll) {
      return false;
    }

    let deltaX, deltaY;
    const speed = this.scrollHandler.speed;
    const DELTA_SCALE = {
      STANDARD: 1,
      OTHERS: -3,
    };

    if (e['deltaX'] != undefined) {
      const deltaModes = [1.0, 28.0, 500.0];
      const deltaMode = deltaModes[e.deltaMode] || deltaModes[0];

      deltaX = e.deltaX / DELTA_SCALE.STANDARD * deltaMode;
      deltaY = e.deltaY / DELTA_SCALE.STANDARD * deltaMode;
    } else if (e['wheelDeltaX'] != undefined) {
      deltaX = e.wheelDeltaX / DELTA_SCALE.OTHERS;
      deltaY = e.wheelDeltaY / DELTA_SCALE.OTHERS;
    } else {
      deltaX = 0;
      deltaY = e.wheelDelta / DELTA_SCALE.OTHERS;
    }

    deltaX *= speed;
    deltaY *= speed;

    deltaX = Math.round(deltaX);
    deltaY = Math.round(deltaY);

    this.scrollHandler.handleScrollEvent(deltaX, deltaY, 0.16, undefined);

    return false;
  }

  handleWheelReleaseEvent() {
    this.wheelEventCaptured = false;
  }

  onStickTo(position: number) {
    this.wheelEventCaptured = true;
    this.wheelEventReleased.next();
  }
}
