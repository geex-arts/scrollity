import { NgZone } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { TimelineMax } from 'gsap';
import 'gsap/ScrollToPlugin';

import { ScrollService } from '../../services/scroll.service';
import { ScrollTriggerDirective } from '../../directives/scroll-trigger/scroll-trigger.directive';
import { ScrollSource } from '../sources/scroll-source.interface';
import { TouchScrollSource } from '../sources/touch-scroll-source';
import { WheelScrollSource } from '../sources/wheel-scroll-source';

export type ScrollHandlerOptions = {
  element: HTMLElement;
  horizontal?: boolean,
  translate?: boolean,
  initialPosition?: number,
  viewport?: any,
  overrideScroll?: boolean,
  speed?: number
};

export interface ScrollTriggerState {
  trigger: ScrollTriggerDirective;
  activated: boolean;
}

export abstract class ScrollHandler {

  abstract getInstantPosition(): number;
  abstract handleScrollEvent(deltaX, deltaY, duration, ease);
  abstract scrollTo(position, duration, ease, cancellable);

  service: ScrollService;
  zone: NgZone;
  element: HTMLElement;
  enabled = true;
  horizontal: boolean;
  translate: boolean;
  initialPosition: number;
  viewport: any;
  overrideScroll: boolean;
  speed: number;
  timeline = new TimelineMax();
  scrollListener: any;
  resizeListener: any;
  animatingScroll = false;
  instantPosition = 0;
  _position = new BehaviorSubject<number>(0);
  _scrollMapPosition = new BehaviorSubject<{ x: number, y: number }>(undefined);
  _viewportSize;
  _contentSize;
  triggerStates: ScrollTriggerState[] = [];
  previousScrollPosition = 0;
  previousStickTo: ScrollTriggerDirective;
  scrollSourceHandlers: ScrollSource[] = [];
  updateContentSizeInterval;
  _scrollOverflow = new Subject<number>();

  constructor(options: ScrollHandlerOptions) {
    this.element = options.element;
    this.horizontal = options.horizontal != undefined ? options.horizontal : false;
    this.translate = options.translate != undefined ? options.translate : false;
    this.initialPosition = options.initialPosition != undefined ? options.initialPosition : 0;
    this.viewport = options.viewport != undefined ? options.viewport : this.element;
    this.overrideScroll = options.overrideScroll != undefined ? options.overrideScroll : true;
    this.speed = options.speed != undefined ? options.speed : 1;
  }

  onInit() {
    if (this.initialPosition) {
      this.scrollTo(this.initialPosition, 0, undefined, false);
    }

    if (this.overrideScroll) {
      this.scrollSourceHandlers.push(
          new TouchScrollSource(this, this.zone),
          new WheelScrollSource(this, this.zone)
      );
    }

    this.setInitialPosition();
    this.updateViewportSize();
    this.updateContentSize();

    this.zone.runOutsideAngular(() => {
      if (this.updateContentSizeInterval) {
        clearInterval(this.updateContentSizeInterval);
      }
      this.updateContentSizeInterval = setInterval(() => this.updateContentSize(), 500);
    });
  }

  setInitialPosition() {
    let value;

    if (this._position == undefined && this.initialPosition) {
      value = this.initialPosition;
    } else {
      value = this.getInstantPosition();
    }

    this.instantPosition = value;
    this._position.next(value);
  }

  addTrigger(trigger) {
    const state = { trigger: trigger, activated: false };
    this.triggerStates.push(state);
    this.updateTriggerState(state)
  }

  removeTrigger(trigger) {
    this.triggerStates = this.triggerStates.filter(item => item !== trigger.trigger);
  }

  enable() {
    this.enabled = true;
  }

  disable() {
    this.enabled = false;
  }

  get handleAllowed() {
    return this.service.handleAllowed(this) && this.enabled;
  }

  bind() {
    this.zone.runOutsideAngular(() => {
      this.scrollListener = () => {
        return this.handleScrollEndEvent();
      };

      this.resizeListener = () => {
        return this.handleResizeEvent();
      };

      if (this.viewport) {
        this.viewport.addEventListener('scroll', this.scrollListener);
      }

      window.addEventListener('resize', this.resizeListener);
    });

    this.scrollSourceHandlers.forEach(item => item.bind());
  }

  unbind() {
    if (this.scrollListener && this.viewport) {
      this.viewport.removeEventListener('scroll', this.scrollListener);
    }

    if (this.resizeListener) {
      window.removeEventListener('resize', this.resizeListener);
    }

    this.scrollSourceHandlers.forEach(item => item.unbind());
  }

  handleScrollEndEvent() {
    window.requestAnimationFrame(() => this.onScroll());
  }

  handleResizeEvent() {
    this.updateViewportSize();
    this.updateContentSize();
    this.updateTriggerPositions();
  }

  get viewportSize() {
    if (!this._viewportSize) {
      this.updateViewportSize();
    }
    return this._viewportSize;
  }

  updateViewportSize() {
    if (!this.viewport) {
      return;
    }

    this._viewportSize = this.translate ? {
      width: this.viewport.parentNode['clientWidth'],
      height: this.viewport.parentNode['clientHeight']
    } : {
      width: this.viewport.clientWidth || this.viewport.innerWidth,
      height: this.viewport.clientHeight || this.viewport.innerHeight
    };
  }

  get contentSize() {
    if (!this._contentSize) {
      this.updateContentSize();
    }
    return this._contentSize;
  }

  updateContentSize() {
    if (!this.element) {
      return;
    }

    this._contentSize = this.translate ? {
      width: this.element.offsetWidth,
      height: this.element.offsetHeight
    } : {
      width: this.element.scrollWidth,
      height: this.element.scrollHeight
    };
  }

  get scrollSize() {
    const viewportSize = this.viewportSize;
    const contentSize = this.contentSize;

    if (!viewportSize || !contentSize) {
      return;
    }

    return {
      width: contentSize.width - viewportSize.width,
      height: contentSize.height - viewportSize.height
    }
  }

  updateTriggerPositions() {
    const changes = this.triggerStates.map(trigger => trigger.trigger.updatePosition());

    if (changes.filter(item => item).length) {
      this.onScroll();
    }
  }

  get position$(): Observable<number> {
    return this._position.asObservable();
  }

  get position() {
    return this._position.value;
  }

  get scrollOverflow$(): Observable<number> {
    return this._scrollOverflow.asObservable();
  }

  normalizePosition(position) {
    if (position < 0) {
      position = 0;
    } else if (this.horizontal && position > this.scrollSize.width) {
      position = this.scrollSize.width;
    } else if (!this.horizontal && position > this.scrollSize.height) {
      position = this.scrollSize.height;
    }

    return position;
  }

  preventScroll(delta): boolean {
    const direction = delta != 0 ? delta / Math.abs(delta) : 0;
    let stickTo: ScrollTriggerDirective;

    for (let state of this.triggerStates) {
      let triggerPosition = this.getTriggerPosition(state.trigger);
      const triggerDelta = triggerPosition - this.position;
      const triggerDirection = triggerDelta != 0 ? triggerDelta / Math.abs(triggerDelta) : 0;

      if (state.trigger.stick != undefined
          && (state.trigger.stick.direction == 0 || state.trigger.stick.direction == direction)
          && triggerDirection == direction
          && this.previousStickTo != state.trigger
          && Math.abs(triggerPosition - this.position) <= (this.horizontal ? this.viewportSize.width : this.viewportSize.height) + state.trigger.stick.distance
          && (!stickTo || Math.abs(stickTo.position - this.position) > Math.abs(triggerDelta))) {
        stickTo = state.trigger;
      }
    }

    if (!stickTo) {
      return false;
    }

    if (Math.abs(delta) < stickTo.stick.threshold) {
      return true;
    }

    this.previousStickTo = stickTo;
    this.scrollSourceHandlers.forEach(item => item.onStickTo(stickTo.position));
    this.scrollTo(stickTo.position, stickTo.stick.duration, stickTo.stick.ease, false);
    stickTo.onSticked();

    return true;
  }

  getTriggerPosition(trigger: ScrollTriggerDirective): number {
    return trigger.position;
  }

  updateTriggerState(trigger: ScrollTriggerState): boolean {
    let triggerPosition = this.getTriggerPosition(trigger.trigger);

    if (this.instantPosition >= triggerPosition && !trigger.activated) {
      trigger.activated = true;
      trigger.trigger.onActivated({
        triggerPosition: triggerPosition,
        previousScrollPosition: this.previousScrollPosition,
        scrollPosition: this.instantPosition
      });

      return true;
    } else if (this.instantPosition < triggerPosition && trigger.activated) {
      trigger.activated = false;
      trigger.trigger.onDeactivated({
        triggerPosition: triggerPosition,
        previousScrollPosition: this.previousScrollPosition,
        scrollPosition: this.instantPosition
      });

      return true;
    } else {
      return false;
    }
  }

  updateTriggerStateForTrigger(trigger: ScrollTriggerDirective): boolean {
    const state = this.triggerStates.find(item => item.trigger === trigger);

    if (!state) {
      return;
    }

    return this.updateTriggerState(state);
  }

  onScroll() {
    let triggered = false;

    this.instantPosition = this.getInstantPosition();

    if (!this.overrideScroll) {
      this._position.next(this.instantPosition);
    }

    for (let state of this.triggerStates) {
      if (this.updateTriggerState(state)) {
        triggered = true;
      }
    }

    if (triggered) {
      this.updateContentSize();
    }
  }
}
