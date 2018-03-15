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
  scrollMapItemPositions: {startPosition: number, endPosition: number, item: ScrollMapItem }[] = [];

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
    this.updateScrollMapItemPositions();
  }

  handleScrollEvent(e, deltaX, deltaY, duration, ease = undefined) {
    let delta = deltaX + deltaY;

    if (this.preventScroll(delta)) {
      return;
    }

    const totalDistance = this._scrollMap
      .map(item => item.getDistance(this.viewportSize))
      .reduce((sum, current) => sum + current);

    const estimatedPosition = this.instantPosition + delta;
    let position;

    if (estimatedPosition < 0) {
      position = 0;
    } else if (estimatedPosition > totalDistance) {
      position = totalDistance;
    } else {
      position = estimatedPosition;
    }

    this.scrollTo(position, duration, ease, true);

    if (estimatedPosition > position) {
      this._scrollOverflow.next(estimatedPosition - position);
    } else if (estimatedPosition < 0) {
      this._scrollOverflow.next(estimatedPosition);
    }
  }

  scrollTo(position, duration, ease = undefined, cancellable = false): Observable<{}> {
    if (position === undefined) {
      return Observable.of({});
    }

    if (!cancellable) {
      this.animatingScroll = true;
    }

    let mapPosition = this.calculateScrollMapPosition(position);
    let params = {
      scrollTo: {
        x: mapPosition.x,
        y: mapPosition.y
      }
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

  calculateScrollMapPosition(position) {
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

    return mapPosition;
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

  updateScrollMapItemPositions() {
    let sum = 0;

    this.scrollMapItemPositions = this._scrollMap.map(item => {
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
