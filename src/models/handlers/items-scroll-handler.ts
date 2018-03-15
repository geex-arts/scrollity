import { Observable } from 'rxjs/Observable';

import { ScrollHandler, ScrollHandlerOptions } from './scroll-handler';
import { Lethargy } from '../../utils/lethargy';

export class ItemsScrollHandler extends ScrollHandler {

  itemSize: number;
  itemsCount: number;
  handleScrollProcessing = false;
  lethargy = new Lethargy();

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

  handleScrollEvent(e, deltaX, deltaY, duration, ease = undefined) {
    if (e.type == 'wheel' && this.lethargy.check(e) == false) {
      return;
    }

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
    if (position === undefined) {
      return Observable.of({});
    }

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
