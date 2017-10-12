import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

import { ScrollHandler } from './scroll-handler';

export class DefaultScrollHandler extends ScrollHandler {

  getInstantPosition(): number {
    return this.horizontal ? this.element.scrollLeft : this.element.scrollTop;
  }

  handleScrollEvent(deltaX, deltaY, duration) {
    let delta = deltaX + deltaY;

    if (this.preventScroll(delta)) {
      return;
    }

    let position = this._position.value;

    position += delta;
    position = this.normalizePosition(position);

    this.scrollTo(position, duration, undefined, true);
  }

  scrollTo(position, duration, ease = undefined, cancellable = false): Observable<{}> {
    if (!cancellable) {
      this.animatingScroll = true;
    }

    this.previousScrollPosition = this.position;

    if (position != this._position.value) {
      this._position.next(position);
    }

    let params;
    let obs = new Subject();

    if (this.translate) {
      params = this.horizontal ? { x: position } : { y: position };
    } else {
      params = this.horizontal ? { scrollLeft: position } : { scrollTop: position };
    }

    if (ease) {
      params['ease'] = ease;
    }

    params['onComplete'] = () => {
      obs.next();

      if (!cancellable) {
        this.animatingScroll = false;
      }
    };

    if (duration) {
      this.timeline = this.timeline.clear().to(this.element, duration, params);
    } else {
      this.timeline = this.timeline.clear().set(this.element, params);
    }

    obs.subscribe(() => {
      position = this._position.value;

      if (position > this.getInstantPosition()) {
        this.updateContentSize();
      }
    });

    return obs;
  }
}
