import { NgZone } from '@angular/core';
import { TimelineMax } from 'gsap';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { ScrollService } from '../services/scroll.service';
import { ScrollTriggerDirective } from '../directives/scroll-trigger/scroll-trigger.directive';
import { ScrollMapItem } from './scroll-map-item';
import * as _ from 'lodash';

export type ScrollHandlerOptions = {
  horizontal?: boolean,
  translate?: boolean,
  initialPosition?: number,
  viewport?: any,
  overrideScroll?: boolean,
  scrollMap?: ScrollMapItem[];
};

export class ScrollHandler {

  enabled = true;
  horizontal: boolean;
  translate: boolean;
  initialPosition: number;
  viewport: any;
  overrideScroll: boolean;
  _scrollMap: ScrollMapItem[];
  timeline = new TimelineMax();
  scrollListener: any;
  mouseWheelListener: any;
  touchStartListener: any;
  touchMoveListener: any;
  touchEndListener: any;
  resizeListener: any;
  animatingScroll = false;
  _position = new BehaviorSubject<number>(0);
  _scrollMapPosition = new BehaviorSubject<{ x: number, y: number }>(undefined);
  _viewportSize;
  _contentSize;
  lastTouch;
  triggers: { trigger: ScrollTriggerDirective, activated: boolean }[] = [];
  previousScrollPosition = 0;
  previousStickTo: ScrollTriggerDirective;

  constructor(private service: ScrollService,
              public element: HTMLElement,
              private zone: NgZone,
              options: ScrollHandlerOptions) {
    this.horizontal = options.horizontal || false;
    this.translate = options.translate || false;
    this.initialPosition = options.initialPosition || 0;
    this.viewport = options.viewport || element;
    this.overrideScroll = options.overrideScroll || true;
    this.scrollMap = options.scrollMap;

    if (this.initialPosition) {
      this.scrollTo(this.initialPosition, 0);
    }

    this.updateViewportSize();
    this.updateContentSize();
  }

  set scrollMap(scrollMap) {
    this._scrollMap = scrollMap;

    if (scrollMap) {
      this._position.next(this.element.scrollLeft + this.element.scrollTop);
    }
  }

  addTrigger(trigger) {
    this.triggers.push({ trigger: trigger, activated: false });
  }

  removeTrigger(trigger) {
    this.triggers = this.triggers.filter(item => item !== trigger.trigger);
  }

  enable() {
    this.enabled = true;
  }

  disable() {
    this.enabled = false;
  }

  bind() {
    this.zone.runOutsideAngular(() => {
      this.scrollListener = () => {
        return this.handleScrollEvent();
      };

      this.resizeListener = () => {
        return this.handleResizeEvent();
      };

      this.viewport.addEventListener('scroll', this.scrollListener);
      window.addEventListener('resize', this.resizeListener);

      if (this.overrideScroll) {
        if (this.mouseWheelListener) {
          return;
        }

        this.mouseWheelListener = e => {
          return this.handleWheelEvent(e);
        };

        this.touchStartListener = e => {
          return this.handleTouchStartEvent(e);
        };

        this.touchMoveListener = e => {
          return this.handleTouchMoveEvent(e);
        };

        this.touchEndListener = () => {
          return this.handleTouchEndEvent();
        };

        document.body.addEventListener('wheel', this.mouseWheelListener);
        document.body.addEventListener('touchstart', this.touchStartListener);
        document.body.addEventListener('touchmove', this.touchMoveListener);
        document.body.addEventListener('touchend', this.touchEndListener);
      }
    });
  }

  unbind() {
    if (this.scrollListener) {
      this.viewport.removeEventListener('scroll', this.scrollListener);
    }

    if (this.mouseWheelListener) {
      document.body.removeEventListener('wheel', this.mouseWheelListener);
    }

    if (this.touchStartListener) {
      document.body.removeEventListener('touchstart', this.touchStartListener);
    }

    if (this.touchMoveListener) {
      document.body.removeEventListener('touchend', this.touchMoveListener);
    }

    if (this.touchEndListener) {
      document.body.removeEventListener('touchmove', this.touchEndListener);
    }

    if (this.resizeListener) {
      window.removeEventListener('resize', this.resizeListener);
    }
  }

  handleScrollEvent() {
    let scrollPosition = this.scrollPosition();

    this.onScroll(scrollPosition);

    if (this._position.value != scrollPosition) {
      this._position.next(scrollPosition);
    }

    this.previousScrollPosition = scrollPosition;
  }

  handleWheelEvent(e) {
    if (!this.service.handleAllowed(this) || !this.enabled) {
      e.preventDefault();
      return false;
    }

    e.preventDefault();
    e.stopPropagation();

    if (this.animatingScroll) {
      return false;
    }

    let deltaX, deltaY;
    const speed = 4;
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

    if (navigator.userAgent.indexOf('Mac OS X') != -1) {
      deltaX /= 4;
      deltaY /= 4;
    }

    deltaX = Math.round(deltaX);
    deltaY = Math.round(deltaY);
    if (this._scrollMap) {
      this.handleScrollMapScrollEvent(deltaX, deltaY);
    } else {
      this.handleDefaultScrollEvent(deltaX, deltaY);
    }

    return false;
  }

  handleTouchStartEvent(e) {
    if (!this.service.handleAllowed(this) || !this.enabled) {
      return false;
    }

    e.stopPropagation();

    if (this.animatingScroll) {
      return false;
    }

    this.lastTouch = { x: e.touches[0].clientX, y: e.touches[0].clientY };

    return false;
  }

  handleTouchMoveEvent(e) {
    if (!this.service.handleAllowed(this)) {
      return false;
    }

    e.preventDefault();
    e.stopPropagation();

    if (this.animatingScroll) {
      return false;
    }

    const speed = 4;
    const touch = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    const deltaX = Math.round(this.lastTouch.x - touch.x) * speed;
    const deltaY = Math.round(this.lastTouch.y - touch.y) * speed;

    if (this.animatingScroll) {
      return false;
    }

    if (this._scrollMap) {
      this.handleScrollMapScrollEvent(deltaX, deltaY);
    } else {
      this.handleDefaultScrollEvent(deltaX, deltaY);
    }

    this.lastTouch = touch;
  }

  handleTouchEndEvent() {
    this.lastTouch = undefined;
  }

  handleScrollMapScrollEvent(deltaX, deltaY) {
    let delta = deltaX + deltaY;

    const totalDistance = this._scrollMap
      .map(item => item.getDistance(this.viewportSize))
      .reduce((sum, current) => sum + current);

    let position = this.scrollPosition();

    this.previousScrollPosition = position;

    position += delta;

    if (position < 0) {
      position = 0;
    } else if (position > totalDistance) {
      position = totalDistance;
    }

    this.scrollToMapPosition(position, 0.1);
  }

  handleDefaultScrollEvent(deltaX, deltaY) {
    let delta = deltaX + deltaY;

    if (this.preventScroll(delta)) {
      return;
    }

    if (this.translate) {
      let params = this.horizontal ? { x: '-=' + delta } : { y: '-=' + delta };

      this.timeline = this.timeline.clear().to(this.element, 0.3, params);
    } else if (navigator.userAgent.indexOf('Mac OS X') != -1) {
      if (this.horizontal) {
        this.element.scrollLeft += delta;
      } else {
        this.element.scrollTop += delta;
      }
    } else {
      let params = this.horizontal ? { scrollLeft: '+=' + delta } : { scrollTop: '+=' + delta };

      this.timeline = this.timeline.clear().to(this.element, 0.3, params);
    }
  }

  handleResizeEvent() {
    this.updateViewportSize();
    this.updateContentSize();
    this.updateTriggerPositions();
    this.updateScrollMapItems();
  }

  scrollTo(position, duration, ease = undefined): Observable<{}> {
    if (this._scrollMap) {
      this.scrollToMapPosition(position, duration, ease);
      return;
    }

    let obs = new Subject();
    let params;

    if (this.translate) {
      params = this.horizontal ? {
        x: 0 - position,
        onUpdateParams: ['{self}'],
        onUpdate: tween => {
          this._position.next(tween.target._gsTransform.x * (-1));
        }
      } : {
        y: 0 - position,
        onUpdateParams: ['{self}'],
        onUpdate: tween => {
          this._position.next(tween.target._gsTransform.y * (-1));
        }
      };
    } else {
      params = this.horizontal ? { scrollLeft: position } : { scrollTop: position };
    }

    params.onComplete = () => {
      this.animatingScroll = false;
      obs.next();
    };

    if (ease) {
      params.ease = ease;
    }

    this.animatingScroll = true;

    if (duration) {
      this.timeline = this.timeline.clear().to(this.element, duration, params);
    } else {
      this.timeline = this.timeline.clear().set(this.element, params);
    }

    return obs.asObservable();
  }

  scrollToMapPosition(position, duration, ease = undefined) {
    let mapDistance = 0;
    let mapPosition = { x: 0, y: 0 };

    _.each(this._scrollMap, item => {
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

    if (ease) {
      params['ease'] = ease;
    }

    if (this._position.value != position) {
      this._position.next(position);
    }

    if (this._scrollMapPosition.value == undefined
      || this._scrollMapPosition.value.x !== mapPosition.x
      || this._scrollMapPosition.value.y !== mapPosition.y) {
      this._scrollMapPosition.next(mapPosition);
    }

    this.timeline = this.timeline.clear().to(this.element, duration, params);
  }

  scrollPosition(): number {
    if (this.translate) {
      return this._position.value;
    } else if (this._scrollMap) {
      return this._position.value;
    } else if (this.horizontal) {
      return this.element.scrollLeft;
    } else {
      return this.element.scrollTop;
    }
  }

  get viewportSize() {
    return this._viewportSize;
  }

  updateViewportSize() {
    this._viewportSize = this.translate ? {
      width: this.viewport.parentNode['clientWidth'],
      height: this.viewport.parentNode['clientHeight']
    } : {
      width: this.viewport.clientWidth || this.viewport.innerWidth,
      height: this.viewport.clientHeight || this.viewport.innerHeight
    };
  }

  get contentSize() {
    return this._contentSize;
  }

  updateContentSize() {
    this._contentSize = this.translate ? {
      width: this.element.offsetWidth,
      height: this.element.offsetHeight
    } : {
      width: this.element.scrollWidth,
      height: this.element.scrollHeight
    };
  }

  updateTriggerPositions() {
    const changes = this.triggers.map(trigger => trigger.trigger.updatePosition());

    if (changes.filter(item => item).length) {
      this.onScroll(this.scrollPosition());
    }
  }

  updateScrollMapItems() {
    if (!this._scrollMap) {
      return;
    }
    this._scrollMap.forEach(item => item.onLayoutUpdated());
  }

  get position(): Observable<number> {
    return this._position.asObservable();
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

  preventScroll(delta): boolean {
    const scrollMapItems = this._scrollMap ? this.scrollMapItemPositions : undefined;
    const direction = delta != 0 ? delta / Math.abs(delta) : 0;
    let stickTo: ScrollTriggerDirective;

    for (let trigger of this.triggers) {
      let triggerPosition = trigger.trigger.position;
      const triggerDelta = triggerPosition - this.scrollPosition();
      const triggerDirection = triggerDelta != 0 ? triggerDelta / Math.abs(triggerDelta) : 0;

      if (this._scrollMap) {
        const scrollMapItem = _.first(scrollMapItems.filter(item => item.item === trigger.trigger.scrollMapItem));

        if (scrollMapItem) {
          triggerPosition += scrollMapItem.startPosition;
        }
      }

      if (trigger.trigger.stick != undefined
          && triggerDirection == direction
          && this.previousStickTo != trigger.trigger
          && Math.abs(triggerPosition - this.scrollPosition()) <= this.viewportSize.width + trigger.trigger.stick
          && (!stickTo || Math.abs(stickTo.position - this.scrollPosition()) > Math.abs(triggerDelta))) {
        stickTo = trigger.trigger;
      }
    }

    if (stickTo) {
      this.previousStickTo = stickTo;
      this.scrollTo(stickTo.position, 0.9);
      return true;
    }

    return false;
  }

  onScroll(position) {
    const scrollMapItems = this._scrollMap ? this.scrollMapItemPositions : undefined;

    for (let trigger of this.triggers) {
      let triggerPosition = trigger.trigger.position;

      if (this._scrollMap) {
        const scrollMapItem = _.first(scrollMapItems.filter(item => item.item === trigger.trigger.scrollMapItem));

        if (scrollMapItem) {
          triggerPosition += scrollMapItem.startPosition;
        }
      }

      if (position >= triggerPosition && !trigger.activated) {
        trigger.activated = true;
        trigger.trigger.onActivated({
          triggerPosition: triggerPosition,
          previousScrollPosition: this.previousScrollPosition,
          scrollPosition: position
        });
      } else if (position < triggerPosition && trigger.activated) {
        trigger.activated = false;
        trigger.trigger.onDeactivated({
          triggerPosition: triggerPosition,
          previousScrollPosition: this.previousScrollPosition,
          scrollPosition: position
        });
      }
    }
  }
}
