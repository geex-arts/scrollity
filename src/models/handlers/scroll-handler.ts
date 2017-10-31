import { NgZone } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { TimelineMax } from 'gsap';

import { ScrollService } from '../../services/scroll.service';
import { ScrollTriggerDirective } from '../../directives/scroll-trigger/scroll-trigger.directive';
import { ScrollSource } from '../sources/scroll-source.interface';
import { TouchScrollSource } from '../sources/touch-scroll-source';
import { WheelScrollSource } from '../sources/wheel-scroll-source';
import { Subject } from 'rxjs/Subject';

export type ScrollHandlerOptions = {
  element: HTMLElement;
  horizontal?: boolean,
  translate?: boolean,
  initialPosition?: number,
  viewport?: any,
  overrideScroll?: boolean
};

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
  timeline = new TimelineMax();
  scrollListener: any;
  resizeListener: any;
  animatingScroll = false;
  instantPosition = 0;
  _position = new BehaviorSubject<number>(0);
  _scrollMapPosition = new BehaviorSubject<{ x: number, y: number }>(undefined);
  _viewportSize;
  _contentSize;
  triggers: { trigger: ScrollTriggerDirective, activated: boolean }[] = [];
  previousScrollPosition = 0;
  previousStickTo: ScrollTriggerDirective;
  scrollSourceHandlers: ScrollSource[] = [];
  updateContentSizeInterval;
  _scrollOverflow = new Subject<number>();

  constructor(options: ScrollHandlerOptions) {
    this.element = options.element;
    this.horizontal = options.horizontal || false;
    this.translate = options.translate || false;
    this.initialPosition = options.initialPosition || 0;
    this.viewport = options.viewport || this.element;
    this.overrideScroll = options.overrideScroll || true;
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

      this.viewport.addEventListener('scroll', this.scrollListener);
      window.addEventListener('resize', this.resizeListener);
    });

    this.scrollSourceHandlers.forEach(item => item.bind());
  }

  unbind() {
    if (this.scrollListener) {
      this.viewport.removeEventListener('scroll', this.scrollListener);
    }

    if (this.resizeListener) {
      window.removeEventListener('resize', this.resizeListener);
    }

    this.scrollSourceHandlers.forEach(item => item.unbind());
  }

  handleScrollEndEvent() {
    this.onScroll();
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
    } else if (this.horizontal && position > this.contentSize.width - this.viewportSize.width) {
      position = this.contentSize.width - this.viewportSize.width;
    } else if (!this.horizontal && position > this.contentSize.height - this.viewportSize.height) {
      position = this.contentSize.height - this.viewportSize.height;
    }

    return position;
  }

  preventScroll(delta): boolean {
    const direction = delta != 0 ? delta / Math.abs(delta) : 0;
    let stickTo: ScrollTriggerDirective;

    for (let trigger of this.triggers) {
      let triggerPosition = this.getTriggerPosition(trigger.trigger);
      const triggerDelta = triggerPosition - this.position;
      const triggerDirection = triggerDelta != 0 ? triggerDelta / Math.abs(triggerDelta) : 0;

      if (trigger.trigger.stick != undefined
          && triggerDirection == direction
          && this.previousStickTo != trigger.trigger
          && Math.abs(triggerPosition - this.position) <= this.viewportSize.width + trigger.trigger.stick.distance
          && (!stickTo || Math.abs(stickTo.position - this.position) > Math.abs(triggerDelta))) {
        stickTo = trigger.trigger;
      }
    }

    if (stickTo) {
      this.previousStickTo = stickTo;
      this.scrollSourceHandlers.forEach(item => item.onStickTo(stickTo.position));
      this.scrollTo(stickTo.position, stickTo.stick.duration, stickTo.stick.ease, false);
      return true;
    }

    return false;
  }

  getTriggerPosition(trigger: ScrollTriggerDirective): number {
    return trigger.position;
  }

  onScroll() {
    let triggered = false;

    this.instantPosition = this.getInstantPosition();

    for (let trigger of this.triggers) {
      let triggerPosition = this.getTriggerPosition(trigger.trigger);

      if (this.position >= triggerPosition && !trigger.activated) {
        trigger.activated = true;
        trigger.trigger.onActivated({
          triggerPosition: triggerPosition,
          previousScrollPosition: this.previousScrollPosition,
          scrollPosition: this.position
        });
        triggered = true;
      } else if (this.position < triggerPosition && trigger.activated) {
        trigger.activated = false;
        trigger.trigger.onDeactivated({
          triggerPosition: triggerPosition,
          previousScrollPosition: this.previousScrollPosition,
          scrollPosition: this.position
        });
        triggered = true;
      }
    }

    if (triggered) {
      this.updateContentSize();
    }
  }
}
