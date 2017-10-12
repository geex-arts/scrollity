import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import * as _ from 'lodash';

import { ScrollTriggerDirective } from '../../directives/scroll-trigger/scroll-trigger.directive';
import { ScrollMapItem } from './map-scroll-handler/scroll-map-item';
import { ScrollHandler, ScrollHandlerOptions } from './scroll-handler';

export class MapScrollHandler extends ScrollHandler {

  _scrollMap: ScrollMapItem[];
  _scrollMapPosition = new BehaviorSubject<{ x: number, y: number }>(undefined);

  constructor(scrollMap: ScrollMapItem[],
              options: ScrollHandlerOptions) {
    super(options);
    this.scrollMap = scrollMap;
  }

  set scrollMap(scrollMap) {
    this._scrollMap = scrollMap;
    this.setInitialPosition();
  }

  getInstantPosition(): number {
    return this.element.scrollLeft + this.element.scrollTop;
  }

  handleResizeEvent() {
    super.handleResizeEvent();
    this.updateScrollMapItems();
  }

  handleScrollEvent(deltaX, deltaY, duration) {
    let delta = deltaX + deltaY;

    if (this.preventScroll(delta)) {
      return;
    }

    const totalDistance = this._scrollMap
      .map(item => item.getDistance(this.viewportSize))
      .reduce((sum, current) => sum + current);

    const estimatedPosition = this.position + delta;
    let position;

    if (estimatedPosition < 0) {
      position = 0;
    } else if (estimatedPosition > totalDistance) {
      position = totalDistance;
    } else {
      position = estimatedPosition;
    }

    this.scrollTo(position, duration, undefined, true);

    if (estimatedPosition > position) {
      this._scrollOverflow.next(estimatedPosition - position);
    } else if (estimatedPosition < 0) {
      this._scrollOverflow.next(estimatedPosition);
    }
  }

  scrollTo(position, duration, ease = undefined, cancellable = false): Observable<{}> {
    if (!cancellable) {
      this.animatingScroll = true;
    }

    let mapDistance = 0;
    let mapPosition = { x: 0, y: 0 };

    this._scrollMap.forEach(item => {
      const distance = item.getDistance(this.viewportSize);
      const percentage = (position - mapDistance) / distance;
      const insidePosition = item.getPosition(this.viewportSize, percentage);

      if (distance >= 0) {
        mapDistance += distance;
      }

      mapPosition.x += insidePosition.x;
      mapPosition.y += insidePosition.y;

      if (percentage >= 0 && percentage < 1) {
        return false;
      }
    });

    let params = {
      scrollLeft: mapPosition.x,
      scrollTop: mapPosition.y
    };
    let obs = new Subject();

    if (ease) {
      params['ease'] = ease;
    }

    params['onComplete'] = () => {
      obs.next();

      if (!cancellable) {
        this.animatingScroll = false;
      }
    };

    this.previousScrollPosition = this.position;

    if (this._position.value != position) {
      this._position.next(position);
    }

    if (this._scrollMapPosition.value == undefined
      || this._scrollMapPosition.value.x !== mapPosition.x
      || this._scrollMapPosition.value.y !== mapPosition.y) {
      this._scrollMapPosition.next(mapPosition);
    }

    if (duration) {
      this.timeline = this.timeline.clear().to(this.element, duration, params);
    } else {
      this.timeline = this.timeline.clear().set(this.element, params);
    }

    return obs;
  }

  updateScrollMapItems() {
    if (!this._scrollMap) {
      return;
    }
    this._scrollMap.forEach(item => item.onLayoutUpdated());
  }

  get scrollMapPosition(): Observable<{ x: number, y: number }> {
    return this._scrollMapPosition.asObservable();
  }

  get scrollMapItemPositions() {
    let sum = 0;
    return this._scrollMap.map(item => {
      const distance = item.getDistance(this.viewportSize);
      const obj = {
        startPosition: sum,
        endPosition: sum + distance,
        item: item
      };
      sum += distance;
      return obj;
    });
  }

  getTriggerPosition(trigger: ScrollTriggerDirective): number {
    let triggerPosition = super.getTriggerPosition(trigger);
    const scrollMapItem = _.first(this.scrollMapItemPositions.filter(item => item.item === trigger.scrollMapItem));

    if (scrollMapItem) {
      triggerPosition += scrollMapItem.startPosition;
    }

    return triggerPosition;
  }
}
