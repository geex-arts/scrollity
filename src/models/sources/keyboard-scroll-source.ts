import { NgZone } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';

import { ScrollHandler } from '../handlers/scroll-handler';
import { ScrollSource } from './scroll-source.interface';

export class KeyboardScrollSource implements ScrollSource {

  subscriptions: Subscription[] = [];

  constructor(private scrollHandler: ScrollHandler,
              private zone: NgZone) { }

  bind() {
    this.zone.runOutsideAngular(() => {
      Observable.fromEvent(document, 'keyup')
        .subscribe((e: KeyboardEvent) => this.handleKeyboardEvent(e));
    });
  }

  unbind() {
    this.subscriptions.forEach(item => item.unsubscribe());
  }

  handleKeyboardEvent(e: KeyboardEvent) {
    const KEY_CODE_DELTAS = {
      32: { x: 0, y: window.innerHeight },
      37: { x: -20, y: 0 },
      38: { x: 0, y: -20 },
      39: { x: 20, y: 0 },
      40: { x: 0, y: 20 }
    };

    if (!KEY_CODE_DELTAS[e.keyCode]) {
      return;
    }

    if (!this.scrollHandler.handleAllowed) {
      e.preventDefault();
      return false;
    }

    e.preventDefault();
    e.stopPropagation();

    if (this.scrollHandler.animatingScroll) {
      return false;
    }

    const delta = KEY_CODE_DELTAS[e.keyCode];
    this.scrollHandler.handleScrollEvent(e, delta.x, delta.y, 0.16, undefined);
    return false;
  }

  onStickTo(position: number) { }
}
