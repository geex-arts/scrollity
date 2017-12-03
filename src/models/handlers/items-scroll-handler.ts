import { Observable } from 'rxjs/Observable';

import { ScrollHandler, ScrollHandlerOptions } from './scroll-handler';

export class ItemsScrollHandler extends ScrollHandler {

  itemSize: number;
  itemsCount: number;
  handleScrollProcessing = false;

  constructor(itemSize: number,
              itemsCount: number,
              options: ScrollHandlerOptions) {
    super(options);
    this.itemSize = itemSize;
    this.itemsCount = itemsCount;
  }

  getInstantPosition(): number {
    return this.position;
  }

  handleScrollEvent(deltaX, deltaY, duration, ease = undefined) {
    if (this.handleScrollProcessing) {
      return;
    }

    let delta = deltaX + deltaY;
    let position;

    if (delta >= this.itemSize && this.position < this.itemsCount - 1) {
      position = this.position + 1;
    } else if (delta <= 0 - this.itemSize && this.position > 0) {
      position = this.position - 1;
    }

    if (position != undefined) {
      this.handleScrollProcessing = true;
      this.scrollTo(position, duration, ease, false);
      setTimeout(() => this.handleScrollProcessing = false, 600);
    }
  }

  scrollTo(position, duration, ease = undefined, cancellable = false): Observable<{}> {
    if (!cancellable) {
      this.animatingScroll = true;
    }

    this.previousScrollPosition = this.position;

    if (position != this._position.value) {
      this._position.next(position);
    }

    const obs = Observable.of([{}]).delay(duration);
    obs.subscribe(() => this.animatingScroll = false);
    return obs;
  }
}
