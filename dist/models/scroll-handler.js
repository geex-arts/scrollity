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
        this.timeline = new gsap_1.TimelineMax();
        this.animatingScroll = false;
        this.instantPosition = 0;
        this._position = new BehaviorSubject_1.BehaviorSubject(0);
        this._scrollMapPosition = new BehaviorSubject_1.BehaviorSubject(undefined);
        this.triggers = [];
        this.previousScrollPosition = 0;
        this.subscriptions = [];
        this.wheelEventReleased = new Subject_1.Subject();
        this.wheelEventCaptured = false;
        this.horizontal = options.horizontal || false;
        this.translate = options.translate || false;
        this.initialPosition = options.initialPosition || 0;
        this.viewport = options.viewport || element;
        this.overrideScroll = options.overrideScroll || true;
        this.scrollMap = options.scrollMap;
        if (this.initialPosition) {
            this.scrollTo(this.initialPosition, 0);
        }
        this.setInitialPosition();
        this.updateViewportSize();
        this.updateContentSize();
    }
    Object.defineProperty(ScrollHandler.prototype, "scrollMap", {
        set: function (scrollMap) {
            this._scrollMap = scrollMap;
            this.setInitialPosition();
        },
        enumerable: true,
        configurable: true
    });
    ScrollHandler.prototype.setInitialPosition = function () {
        var value;
        if (this._position == undefined && this.initialPosition) {
            value = this.initialPosition;
        }
        else {
            value = this.getInstantPosition();
        }
        this.instantPosition = value;
        this._position.next(value);
    };
    ScrollHandler.prototype.getInstantPosition = function () {
        if (this._scrollMap) {
            return this.element.scrollLeft + this.element.scrollTop;
        }
        else {
            return this.horizontal ? this.element.scrollLeft : this.element.scrollTop;
        }
    };
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
        this.subscriptions.push(this.wheelEventReleased.debounceTime(600).subscribe(function () { return _this.handleWheelReleaseEvent(); }));
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
        this.subscriptions.forEach(function (item) { return item.unsubscribe(); });
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
        this.onScroll();
    };
    ScrollHandler.prototype.handleWheelEvent = function (e) {
        if (!this.service.handleAllowed(this) || !this.enabled) {
            e.preventDefault();
            return false;
        }
        e.preventDefault();
        e.stopPropagation();
        if (this.wheelEventCaptured) {
            if (this.animatingScroll) {
                this.wheelEventReleased.next(e);
            }
            return;
        }
        if (this.animatingScroll) {
            return false;
        }
        var deltaX, deltaY;
        var speed = 1;
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
        deltaX = Math.round(deltaX);
        deltaY = Math.round(deltaY);
        if (this._scrollMap) {
            this.handleScrollMapScrollEvent(deltaX, deltaY);
        }
        else {
            this.handleDefaultScrollEvent(deltaX, deltaY);
        }
        return false;
    };
    ScrollHandler.prototype.handleWheelReleaseEvent = function () {
        this.wheelEventCaptured = false;
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
        var speed = 1;
        var touch = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        var deltaX = Math.round(this.lastTouch.x - touch.x) * speed;
        var deltaY = Math.round(this.lastTouch.y - touch.y) * speed;
        if (this.animatingScroll) {
            return false;
        }
        if (this._scrollMap) {
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
    ScrollHandler.prototype.handleScrollMapScrollEvent = function (deltaX, deltaY) {
        var _this = this;
        var delta = deltaX + deltaY;
        var totalDistance = this._scrollMap
            .map(function (item) { return item.getDistance(_this.viewportSize); })
            .reduce(function (sum, current) { return sum + current; });
        var position = this.position;
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
        if (this.preventScroll(delta)) {
            return;
        }
        var position = this._position.value;
        position += delta;
        if (position < 0) {
            position = 0;
        }
        this.scrollToBasicPosition(position, 0.16);
    };
    ScrollHandler.prototype.handleResizeEvent = function () {
        this.updateViewportSize();
        this.updateContentSize();
        this.updateTriggerPositions();
        this.updateScrollMapItems();
    };
    ScrollHandler.prototype.scrollTo = function (position, duration, ease) {
        var _this = this;
        if (ease === void 0) { ease = undefined; }
        var obs;
        this.animatingScroll = true;
        if (this._scrollMap) {
            obs = this.scrollToMapPosition(position, duration, ease);
        }
        else {
            obs = this.scrollToBasicPosition(position, duration, ease);
        }
        obs.subscribe(function () { return _this.animatingScroll = false; });
        return obs;
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
        var obs = new Subject_1.Subject();
        if (ease) {
            params['ease'] = ease;
        }
        params['onComplete'] = function () {
            obs.next();
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
        }
        else {
            this.timeline = this.timeline.clear().set(this.element, params);
        }
        return obs;
    };
    ScrollHandler.prototype.scrollToBasicPosition = function (position, duration, ease) {
        var _this = this;
        if (ease === void 0) { ease = undefined; }
        this.previousScrollPosition = this.position;
        if (position != this._position.value) {
            this._position.next(position);
        }
        var params;
        var obs = new Subject_1.Subject();
        if (this.translate) {
            params = this.horizontal ? { x: position } : { y: position };
        }
        else {
            params = this.horizontal ? { scrollLeft: position } : { scrollTop: position };
        }
        if (ease) {
            params['ease'] = ease;
        }
        params['onComplete'] = function () {
            obs.next();
            _this.animatingScroll = false; // workaround
        };
        if (duration) {
            this.timeline = this.timeline.clear().to(this.element, duration, params);
        }
        else {
            this.timeline = this.timeline.clear().set(this.element, params);
        }
        obs.subscribe(function () {
            position = _this._position.value;
            if (position > _this.getInstantPosition()) {
                _this.updateContentSize();
            }
            position = _this.normalizePosition(position);
            if (position != _this._position.value) {
                _this._position.next(position);
            }
        });
        return obs;
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
            this.onScroll();
        }
    };
    ScrollHandler.prototype.updateScrollMapItems = function () {
        if (!this._scrollMap) {
            return;
        }
        this._scrollMap.forEach(function (item) { return item.onLayoutUpdated(); });
    };
    Object.defineProperty(ScrollHandler.prototype, "position$", {
        get: function () {
            return this._position.asObservable();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ScrollHandler.prototype, "position", {
        get: function () {
            return this._position.value;
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
    ScrollHandler.prototype.normalizePosition = function (position) {
        if (position < 0) {
            position = 0;
        }
        else if (this.horizontal && position > this.contentSize.width - this.viewportSize.width) {
            position = this.contentSize.width - this.viewportSize.width;
        }
        else if (!this.horizontal && position > this.contentSize.height - this.viewportSize.height) {
            position = this.contentSize.height - this.viewportSize.height;
        }
        return position;
    };
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
    ScrollHandler.prototype.preventScroll = function (delta) {
        var scrollMapItems = this._scrollMap ? this.scrollMapItemPositions : undefined;
        var direction = delta != 0 ? delta / Math.abs(delta) : 0;
        var stickTo;
        var _loop_1 = function (trigger) {
            var triggerPosition = trigger.trigger.position;
            var triggerDelta = triggerPosition - this_1.position;
            var triggerDirection = triggerDelta != 0 ? triggerDelta / Math.abs(triggerDelta) : 0;
            if (this_1._scrollMap) {
                var scrollMapItem = _.first(scrollMapItems.filter(function (item) { return item.item === trigger.trigger.scrollMapItem; }));
                if (scrollMapItem) {
                    triggerPosition += scrollMapItem.startPosition;
                }
            }
            if (trigger.trigger.stick != undefined
                && triggerDirection == direction
                && this_1.previousStickTo != trigger.trigger
                && Math.abs(triggerPosition - this_1.position) <= this_1.viewportSize.width + trigger.trigger.stick
                && (!stickTo || Math.abs(stickTo.position - this_1.position) > Math.abs(triggerDelta))) {
                stickTo = trigger.trigger;
            }
        };
        var this_1 = this;
        for (var _i = 0, _a = this.triggers; _i < _a.length; _i++) {
            var trigger = _a[_i];
            _loop_1(trigger);
        }
        if (stickTo) {
            this.previousStickTo = stickTo;
            this.wheelEventCaptured = true;
            this.wheelEventReleased.next();
            this.scrollTo(stickTo.position, 0.9);
            return true;
        }
        return false;
    };
    ScrollHandler.prototype.onScroll = function () {
        var scrollMapItems = this._scrollMap ? this.scrollMapItemPositions : undefined;
        var triggered = false;
        this.instantPosition = this.getInstantPosition();
        var _loop_2 = function (trigger) {
            var triggerPosition = trigger.trigger.position;
            if (this_2._scrollMap) {
                var scrollMapItem = _.first(scrollMapItems.filter(function (item) { return item.item === trigger.trigger.scrollMapItem; }));
                if (scrollMapItem) {
                    triggerPosition += scrollMapItem.startPosition;
                }
            }
            if (this_2.position >= triggerPosition && !trigger.activated) {
                trigger.activated = true;
                trigger.trigger.onActivated({
                    triggerPosition: triggerPosition,
                    previousScrollPosition: this_2.previousScrollPosition,
                    scrollPosition: this_2.position
                });
                triggered = true;
            }
            else if (this_2.position < triggerPosition && trigger.activated) {
                trigger.activated = false;
                trigger.trigger.onDeactivated({
                    triggerPosition: triggerPosition,
                    previousScrollPosition: this_2.previousScrollPosition,
                    scrollPosition: this_2.position
                });
                triggered = true;
            }
        };
        var this_2 = this;
        for (var _i = 0, _a = this.triggers; _i < _a.length; _i++) {
            var trigger = _a[_i];
            _loop_2(trigger);
        }
        if (triggered) {
            this.updateContentSize();
        }
    };
    return ScrollHandler;
}());
exports.ScrollHandler = ScrollHandler;
//# sourceMappingURL=scroll-handler.js.map