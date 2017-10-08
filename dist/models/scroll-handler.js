"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var gsap_1 = require("gsap");
var Subject_1 = require("rxjs/Subject");
var BehaviorSubject_1 = require("rxjs/BehaviorSubject");
var _ = require("lodash");
var ScrollHandler = /** @class */ (function () {
    function ScrollHandler(service, element, zone, options) {
        this.service = service;
        this.element = element;
        this.zone = zone;
        this.enabled = true;
        this._slidesObservable = new Subject_1.Subject();
        this.timeline = new gsap_1.TimelineMax();
        this.animatingScroll = false;
        this._position = new BehaviorSubject_1.BehaviorSubject(0);
        this._scrollMapPosition = new BehaviorSubject_1.BehaviorSubject(undefined);
        this.triggers = [];
        this.previousScrollPosition = 0;
        this.horizontal = options.horizontal || false;
        this.slides = options.slides || false;
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
    Object.defineProperty(ScrollHandler.prototype, "scrollMap", {
        set: function (scrollMap) {
            this._scrollMap = scrollMap;
            if (scrollMap) {
                this._position.next(this.element.scrollLeft + this.element.scrollTop);
            }
        },
        enumerable: true,
        configurable: true
    });
    ScrollHandler.prototype.addTrigger = function (trigger) {
        this.triggers.push({ trigger: trigger, activated: false });
    };
    ScrollHandler.prototype.removeTrigger = function (trigger) {
        this.triggers = this.triggers.filter(function (item) { return item !== trigger.trigger; });
    };
    ScrollHandler.prototype.enable = function () {
        this.enabled = true;
    };
    ScrollHandler.prototype.disable = function () {
        this.enabled = false;
    };
    ScrollHandler.prototype.bind = function () {
        var _this = this;
        this.zone.runOutsideAngular(function () {
            _this.scrollListener = function () {
                return _this.handleScrollEvent();
            };
            _this.resizeListener = function () {
                return _this.handleResizeEvent();
            };
            _this.viewport.addEventListener('scroll', _this.scrollListener);
            window.addEventListener('resize', _this.resizeListener);
            if (_this.overrideScroll) {
                if (_this.mouseWheelListener) {
                    return;
                }
                _this.mouseWheelListener = function (e) {
                    return _this.handleWheelEvent(e);
                };
                _this.touchStartListener = function (e) {
                    return _this.handleTouchStartEvent(e);
                };
                _this.touchMoveListener = function (e) {
                    return _this.handleTouchMoveEvent(e);
                };
                _this.touchEndListener = function () {
                    return _this.handleTouchEndEvent();
                };
                document.body.addEventListener('wheel', _this.mouseWheelListener);
                document.body.addEventListener('touchstart', _this.touchStartListener);
                document.body.addEventListener('touchmove', _this.touchMoveListener);
                document.body.addEventListener('touchend', _this.touchEndListener);
            }
        });
    };
    ScrollHandler.prototype.unbind = function () {
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
    };
    ScrollHandler.prototype.handleScrollEvent = function () {
        var scrollPosition = this.scrollPosition();
        this.onScroll(scrollPosition);
        if (this._position.value != scrollPosition) {
            this._position.next(scrollPosition);
        }
        this.previousScrollPosition = scrollPosition;
    };
    ScrollHandler.prototype.handleWheelEvent = function (e) {
        if (!this.service.handleAllowed(this) || !this.enabled) {
            e.preventDefault();
            return false;
        }
        e.preventDefault();
        e.stopPropagation();
        if (this.animatingScroll) {
            return false;
        }
        var deltaX, deltaY;
        var speed = 4;
        var DELTA_SCALE = {
            STANDARD: 1,
            OTHERS: -3,
        };
        if (e['deltaX'] != undefined) {
            var deltaModes = [1.0, 28.0, 500.0];
            var deltaMode = deltaModes[e.deltaMode] || deltaModes[0];
            deltaX = e.deltaX / DELTA_SCALE.STANDARD * deltaMode;
            deltaY = e.deltaY / DELTA_SCALE.STANDARD * deltaMode;
        }
        else if (e['wheelDeltaX'] != undefined) {
            deltaX = e.wheelDeltaX / DELTA_SCALE.OTHERS;
            deltaY = e.wheelDeltaY / DELTA_SCALE.OTHERS;
        }
        else {
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
        if (this.slides) {
            this.handleSlideScrollEvent(deltaX, deltaY);
        }
        else if (this._scrollMap) {
            this.handleScrollMapScrollEvent(deltaX, deltaY);
        }
        else {
            this.handleDefaultScrollEvent(deltaX, deltaY);
        }
        return false;
    };
    ScrollHandler.prototype.handleTouchStartEvent = function (e) {
        if (!this.service.handleAllowed(this) || !this.enabled) {
            return false;
        }
        e.stopPropagation();
        if (this.animatingScroll) {
            return false;
        }
        this.lastTouch = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        return false;
    };
    ScrollHandler.prototype.handleTouchMoveEvent = function (e) {
        if (!this.service.handleAllowed(this)) {
            return false;
        }
        e.preventDefault();
        e.stopPropagation();
        if (this.animatingScroll) {
            return false;
        }
        var speed = 4;
        var touch = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        var deltaX = Math.round(this.lastTouch.x - touch.x) * speed;
        var deltaY = Math.round(this.lastTouch.y - touch.y) * speed;
        if (this.animatingScroll) {
            return false;
        }
        if (this.slides) {
            this.handleSlideScrollEvent(deltaX, deltaY);
        }
        else if (this._scrollMap) {
            this.handleScrollMapScrollEvent(deltaX, deltaY);
        }
        else {
            this.handleDefaultScrollEvent(deltaX, deltaY);
        }
        this.lastTouch = touch;
    };
    ScrollHandler.prototype.handleTouchEndEvent = function () {
        this.lastTouch = undefined;
    };
    ScrollHandler.prototype.handleSlideScrollEvent = function (deltaX, deltaY) {
        var threshold = navigator.userAgent.indexOf('Mac OS X') != -1 ? 16 : 40;
        if (this.lastSlideDate && new Date().getTime() - this.lastSlideDate.getTime() < 1000) {
            if (new Date().getTime() - this.lastSlideScrollDate.getTime() < 200) {
                this.lastSlideScrollDate = new Date();
                return;
            }
            else {
                this.lastSlideDate = undefined;
                this.lastSlideScrollDate = undefined;
            }
        }
        else {
            this.lastSlideDate = undefined;
            this.lastSlideScrollDate = undefined;
        }
        if (deltaX + deltaY <= 0 - threshold) {
            this.lastSlideDate = new Date();
            this.lastSlideScrollDate = new Date();
            this._slidesObservable.next({ forwardDirection: false });
        }
        else if (deltaX + deltaY >= threshold) {
            this.lastSlideDate = new Date();
            this.lastSlideScrollDate = new Date();
            this._slidesObservable.next({ forwardDirection: true });
        }
    };
    ScrollHandler.prototype.handleScrollMapScrollEvent = function (deltaX, deltaY) {
        var _this = this;
        var delta = deltaX + deltaY;
        var totalDistance = this._scrollMap
            .map(function (item) { return item.getDistance(_this.viewportSize); })
            .reduce(function (sum, current) { return sum + current; });
        var position = this.scrollPosition();
        this.previousScrollPosition = position;
        position += delta;
        if (position < 0) {
            position = 0;
        }
        else if (position > totalDistance) {
            position = totalDistance;
        }
        this.scrollToMapPosition(position, 0.1);
    };
    ScrollHandler.prototype.handleDefaultScrollEvent = function (deltaX, deltaY) {
        var delta = deltaX + deltaY;
        if (this.translate) {
            var params = this.horizontal ? { x: '-=' + delta } : { y: '-=' + delta };
            this.timeline = this.timeline.clear().to(this.element, 0.3, params);
        }
        else if (navigator.userAgent.indexOf('Mac OS X') != -1) {
            if (this.horizontal) {
                this.element.scrollLeft += delta;
            }
            else {
                this.element.scrollTop += delta;
            }
        }
        else {
            var params = this.horizontal ? { scrollLeft: '+=' + delta } : { scrollTop: '+=' + delta };
            this.timeline = this.timeline.clear().to(this.element, 0.3, params);
        }
    };
    ScrollHandler.prototype.handleResizeEvent = function () {
        this.updateViewportSize();
        this.updateContentSize();
        this.updateTriggerPositions();
        this.updateScrollMapItems();
    };
    Object.defineProperty(ScrollHandler.prototype, "slidesObservable", {
        get: function () {
            return this._slidesObservable.asObservable();
        },
        enumerable: true,
        configurable: true
    });
    ScrollHandler.prototype.scrollTo = function (position, duration, ease) {
        var _this = this;
        if (ease === void 0) { ease = undefined; }
        if (this._scrollMap) {
            this.scrollToMapPosition(position, duration, ease);
            return;
        }
        var obs = new Subject_1.Subject();
        var params;
        if (this.translate) {
            params = this.horizontal ? {
                x: 0 - position,
                onUpdateParams: ['{self}'],
                onUpdate: function (tween) {
                    _this._position.next(tween.target._gsTransform.x * (-1));
                }
            } : {
                y: 0 - position,
                onUpdateParams: ['{self}'],
                onUpdate: function (tween) {
                    _this._position.next(tween.target._gsTransform.y * (-1));
                }
            };
        }
        else {
            params = this.horizontal ? { scrollLeft: position } : { scrollTop: position };
        }
        params.onComplete = function () {
            _this.animatingScroll = false;
            obs.next();
        };
        if (ease) {
            params.ease = ease;
        }
        this.animatingScroll = true;
        if (duration) {
            this.timeline = this.timeline.clear().to(this.element, duration, params);
        }
        else {
            this.timeline = this.timeline.clear().set(this.element, params);
        }
        return obs.asObservable();
    };
    ScrollHandler.prototype.scrollToMapPosition = function (position, duration, ease) {
        var _this = this;
        if (ease === void 0) { ease = undefined; }
        var mapDistance = 0;
        var mapPosition = { x: 0, y: 0 };
        _.each(this._scrollMap, function (item) {
            var distance = item.getDistance(_this.viewportSize);
            var percentage = (position - mapDistance) / distance;
            var insidePosition = item.getPosition(_this.viewportSize, percentage);
            if (distance >= 0) {
                mapDistance += distance;
            }
            mapPosition.x += insidePosition.x;
            mapPosition.y += insidePosition.y;
            if (percentage >= 0 && percentage < 1) {
                return false;
            }
        });
        var params = {
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
    };
    ScrollHandler.prototype.scrollPosition = function () {
        if (this.translate) {
            return this._position.value;
        }
        else if (this._scrollMap) {
            return this._position.value;
        }
        else if (this.horizontal) {
            return this.element.scrollLeft;
        }
        else {
            return this.element.scrollTop;
        }
    };
    Object.defineProperty(ScrollHandler.prototype, "viewportSize", {
        get: function () {
            return this._viewportSize;
        },
        enumerable: true,
        configurable: true
    });
    ScrollHandler.prototype.updateViewportSize = function () {
        this._viewportSize = this.translate ? {
            width: this.viewport.parentNode['clientWidth'],
            height: this.viewport.parentNode['clientHeight']
        } : {
            width: this.viewport.clientWidth || this.viewport.innerWidth,
            height: this.viewport.clientHeight || this.viewport.innerHeight
        };
    };
    Object.defineProperty(ScrollHandler.prototype, "contentSize", {
        get: function () {
            return this._contentSize;
        },
        enumerable: true,
        configurable: true
    });
    ScrollHandler.prototype.updateContentSize = function () {
        this._contentSize = this.translate ? {
            width: this.element.offsetWidth,
            height: this.element.offsetHeight
        } : {
            width: this.element.scrollWidth,
            height: this.element.scrollHeight
        };
    };
    ScrollHandler.prototype.updateTriggerPositions = function () {
        var changes = this.triggers.map(function (trigger) { return trigger.trigger.updatePosition(); });
        if (changes.filter(function (item) { return item; }).length) {
            this.onScroll(this.scrollPosition());
        }
    };
    ScrollHandler.prototype.updateScrollMapItems = function () {
        if (!this._scrollMap) {
            return;
        }
        this._scrollMap.forEach(function (item) { return item.onLayoutUpdated(); });
    };
    Object.defineProperty(ScrollHandler.prototype, "position", {
        get: function () {
            return this._position.asObservable();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ScrollHandler.prototype, "scrollMapPosition", {
        get: function () {
            return this._scrollMapPosition.asObservable();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ScrollHandler.prototype, "scrollMapItemPositions", {
        get: function () {
            var _this = this;
            var sum = 0;
            return this._scrollMap.map(function (item) {
                var distance = item.getDistance(_this.viewportSize);
                var obj = {
                    startPosition: sum,
                    endPosition: sum + distance,
                    item: item
                };
                sum += distance;
                return obj;
            });
        },
        enumerable: true,
        configurable: true
    });
    ScrollHandler.prototype.onScroll = function (position) {
        var scrollMapItems = this._scrollMap ? this.scrollMapItemPositions : undefined;
        var _loop_1 = function (trigger) {
            var triggerPosition = trigger.trigger.position;
            if (this_1._scrollMap) {
                var scrollMapItem = _.first(scrollMapItems.filter(function (item) { return item.item === trigger.trigger.scrollMapItem; }));
                if (scrollMapItem) {
                    triggerPosition += scrollMapItem.startPosition;
                }
            }
            if (position >= triggerPosition && !trigger.activated) {
                trigger.activated = true;
                trigger.trigger.onActivated({
                    triggerPosition: triggerPosition,
                    previousScrollPosition: this_1.previousScrollPosition,
                    scrollPosition: position
                });
            }
            else if (position < triggerPosition && trigger.activated) {
                trigger.activated = false;
                trigger.trigger.onDeactivated({
                    triggerPosition: triggerPosition,
                    previousScrollPosition: this_1.previousScrollPosition,
                    scrollPosition: position
                });
            }
        };
        var this_1 = this;
        for (var _i = 0, _a = this.triggers; _i < _a.length; _i++) {
            var trigger = _a[_i];
            _loop_1(trigger);
        }
    };
    return ScrollHandler;
}());
exports.ScrollHandler = ScrollHandler;
//# sourceMappingURL=scroll-handler.js.map