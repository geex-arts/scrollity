import { TimelineMax } from 'gsap';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { ScrollService } from './scroll.service';
import { ScrollTriggerDirective } from './scroll-trigger/scroll-trigger.directive';

export type ScrollHandlerOptions = {
  horizontal?: boolean,
  slides?: boolean,
  translate?: boolean,
  initialPosition?: number
};

export class ScrollHandler {

  enabled = true;
  horizontal: boolean;
  slides: boolean;
  _slidesObservable = new Subject<{ forwardDirection: boolean }>();
  translate: boolean;
  initialPosition: number;
  lastSlideDate: Date;
  lastSlideScrollDate: Date;
  timeline = new TimelineMax();
  scrollListener: any;
  mouseWheelListener: any;
  touchStartListener: any;
  touchMoveListener: any;
  touchEndListener: any;
  resizeListener: any;
  animatingScroll = false;
  _position = new BehaviorSubject<number>(0);
  _viewportSize;
  _contentSize;
  lastTouch;
  triggers: { trigger: ScrollTriggerDirective, activated: boolean }[] = [];
  previousScrollPosition = 0;

  constructor(private service: ScrollService,
              public element: HTMLElement,
              options: ScrollHandlerOptions) {
    this.horizontal = options.horizontal || false;
    this.slides = options.slides || false;
    this.translate = options.translate || false;
    this.initialPosition = options.initialPosition || 0;

    if (this.initialPosition) {
      this.scrollTo(this.initialPosition, 0);
    }

    this.updateViewportSize();
    this.updateContentSize();
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
    if (this.mouseWheelListener) {
      return;
    }

    this.scrollListener = () => {
      return this.handleScrollEvent();
    };

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

    this.resizeListener = () => {
      return this.handleResizeEvent();
    };

    this.element.addEventListener('scroll', this.scrollListener);
    document.body.addEventListener('wheel', this.mouseWheelListener);
    document.body.addEventListener('touchstart', this.touchStartListener);
    document.body.addEventListener('touchmove', this.touchMoveListener);
    document.body.addEventListener('touchend', this.touchEndListener);
    window.addEventListener('resize', this.resizeListener);
  }

  unbind() {
    if (this.scrollListener) {
      document.body.removeEventListener('scroll', this.scrollListener);
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

    this._position.next(scrollPosition);
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

    if (this.slides) {
      this.handleSlideScrollEvent(deltaX, deltaY);
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

    const touch = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    const deltaX = this.lastTouch.x - touch.x;
    const deltaY = this.lastTouch.y - touch.y;

    if (this.animatingScroll) {
      return false;
    }

    if (this.slides) {
      this.handleSlideScrollEvent(deltaX, deltaY);
    } else {
      this.handleDefaultScrollEvent(deltaX, deltaY);
    }

    this.lastTouch = touch;
  }

  handleTouchEndEvent() {
    this.lastTouch = undefined;
  }

  handleSlideScrollEvent(deltaX, deltaY) {
    const threshold = navigator.userAgent.indexOf('Mac OS X') != -1 ? 16 : 40;

    if (this.lastSlideDate && new Date().getTime() - this.lastSlideDate.getTime() < 1000) {
      if (new Date().getTime() - this.lastSlideScrollDate.getTime() < 200) {
        this.lastSlideScrollDate = new Date();
        return;
      } else {
        this.lastSlideDate = undefined;
        this.lastSlideScrollDate = undefined;
      }
    } else {
      this.lastSlideDate = undefined;
      this.lastSlideScrollDate = undefined;
    }

    if (deltaX + deltaY <= 0 - threshold) {
      this.lastSlideDate = new Date();
      this.lastSlideScrollDate = new Date();

      this._slidesObservable.next({ forwardDirection: false });
    } else if (deltaX + deltaY >= threshold) {
      this.lastSlideDate = new Date();
      this.lastSlideScrollDate = new Date();

      this._slidesObservable.next({ forwardDirection: true });
    }
  }

  handleDefaultScrollEvent(deltaX, deltaY) {
    deltaX = Math.round(deltaX);
    deltaY = Math.round(deltaY);

    let delta = deltaX + deltaY;

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
  }

  get slidesObservable(): Observable<{ forwardDirection: boolean }> {
    return this._slidesObservable.asObservable();
  }

  scrollTo(position, duration, ease = undefined): Observable<{}> {
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

    params.onComplete =() => {
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

  scrollPosition(): number {
    if (this.translate) {
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
      width: this.element.parentNode['clientWidth'],
      height: this.element.parentNode['clientHeight']
    } : {
      width: this.element.clientWidth,
      height: this.element.clientHeight
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

  get position(): Observable<number> {
    return this._position.asObservable();
  }

  onScroll(scrollPosition) {
    for (let trigger of this.triggers) {
      if (scrollPosition >= trigger.trigger.position && !trigger.activated) {
        trigger.activated = true;
        trigger.trigger.onActivated({
          triggerPosition: trigger.trigger.position,
          previousScrollPosition: this.previousScrollPosition,
          scrollPosition: scrollPosition
        });
      } else if (scrollPosition < trigger.trigger.position && trigger.activated) {
        trigger.activated = false;
        trigger.trigger.onDeactivated({
          triggerPosition: trigger.trigger.position,
          previousScrollPosition: this.previousScrollPosition,
          scrollPosition: scrollPosition
        });
      }
    }
  }
}
