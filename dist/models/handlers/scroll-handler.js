"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Subject_1 = require("rxjs/Subject");
var BehaviorSubject_1 = require("rxjs/BehaviorSubject");
var gsap_1 = require("gsap");
require("gsap/ScrollToPlugin");
var touch_scroll_source_1 = require("../sources/touch-scroll-source");
var wheel_scroll_source_1 = require("../sources/wheel-scroll-source");
var ScrollHandler = /** @class */ (function () {
    function ScrollHandler(options) {
        this.enabled = true;
        this.timeline = new gsap_1.TimelineMax();
        this.animatingScroll = false;
        this.instantPosition = 0;
        this._position = new BehaviorSubject_1.BehaviorSubject(0);
        this._scrollMapPosition = new BehaviorSubject_1.BehaviorSubject(undefined);
        this.triggerStates = [];
        this.previousScrollPosition = 0;
        this.scrollSourceHandlers = [];
        this._scrollOverflow = new Subject_1.Subject();
        this.element = options.element;
        this.horizontal = options.horizontal != undefined ? options.horizontal : false;
        this.translate = options.translate != undefined ? options.translate : false;
        this.initialPosition = options.initialPosition != undefined ? options.initialPosition : 0;
        this.viewport = options.viewport != undefined ? options.viewport : this.element;
        this.overrideScroll = options.overrideScroll != undefined ? options.overrideScroll : true;
        this.speed = options.speed != undefined ? options.speed : 1;
    }
    ScrollHandler.prototype.onInit = function () {
        var _this = this;
        if (this.initialPosition) {
            this.scrollTo(this.initialPosition, 0, undefined, false);
        }
        if (this.overrideScroll) {
            this.scrollSourceHandlers.push(new touch_scroll_source_1.TouchScrollSource(this, this.zone), new wheel_scroll_source_1.WheelScrollSource(this, this.zone));
        }
        this.setInitialPosition();
        this.updateViewportSize();
        this.updateContentSize();
        this.zone.runOutsideAngular(function () {
            if (_this.updateContentSizeInterval) {
                clearInterval(_this.updateContentSizeInterval);
            }
            _this.updateContentSizeInterval = setInterval(function () { return _this.updateContentSize(); }, 500);
        });
    };
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
    ScrollHandler.prototype.addTrigger = function (trigger) {
        var state = { trigger: trigger, activated: false };
        this.triggerStates.push(state);
        this.updateTriggerState(state);
    };
    ScrollHandler.prototype.removeTrigger = function (trigger) {
        this.triggerStates = this.triggerStates.filter(function (item) { return item !== trigger.trigger; });
    };
    ScrollHandler.prototype.enable = function () {
        this.enabled = true;
    };
    ScrollHandler.prototype.disable = function () {
        this.enabled = false;
    };
    Object.defineProperty(ScrollHandler.prototype, "handleAllowed", {
        get: function () {
            return this.service.handleAllowed(this) && this.enabled;
        },
        enumerable: true,
        configurable: true
    });
    ScrollHandler.prototype.bind = function () {
        var _this = this;
        this.zone.runOutsideAngular(function () {
            _this.scrollListener = function () {
                return _this.handleScrollEndEvent();
            };
            _this.resizeListener = function () {
                return _this.handleResizeEvent();
            };
            if (_this.viewport) {
                _this.viewport.addEventListener('scroll', _this.scrollListener);
            }
            window.addEventListener('resize', _this.resizeListener);
        });
        this.scrollSourceHandlers.forEach(function (item) { return item.bind(); });
    };
    ScrollHandler.prototype.unbind = function () {
        if (this.scrollListener && this.viewport) {
            this.viewport.removeEventListener('scroll', this.scrollListener);
        }
        if (this.resizeListener) {
            window.removeEventListener('resize', this.resizeListener);
        }
        this.scrollSourceHandlers.forEach(function (item) { return item.unbind(); });
    };
    ScrollHandler.prototype.handleScrollEndEvent = function () {
        var _this = this;
        window.requestAnimationFrame(function () { return _this.onScroll(); });
    };
    ScrollHandler.prototype.handleResizeEvent = function () {
        this.updateViewportSize();
        this.updateContentSize();
        this.updateTriggerPositions();
    };
    Object.defineProperty(ScrollHandler.prototype, "viewportSize", {
        get: function () {
            if (!this._viewportSize) {
                this.updateViewportSize();
            }
            return this._viewportSize;
        },
        enumerable: true,
        configurable: true
    });
    ScrollHandler.prototype.updateViewportSize = function () {
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
    };
    Object.defineProperty(ScrollHandler.prototype, "contentSize", {
        get: function () {
            if (!this._contentSize) {
                this.updateContentSize();
            }
            return this._contentSize;
        },
        enumerable: true,
        configurable: true
    });
    ScrollHandler.prototype.updateContentSize = function () {
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
    };
    Object.defineProperty(ScrollHandler.prototype, "scrollSize", {
        get: function () {
            var viewportSize = this.viewportSize;
            var contentSize = this.contentSize;
            if (!viewportSize || !contentSize) {
                return;
            }
            return {
                width: contentSize.width - viewportSize.width,
                height: contentSize.height - viewportSize.height
            };
        },
        enumerable: true,
        configurable: true
    });
    ScrollHandler.prototype.updateTriggerPositions = function () {
        var changes = this.triggerStates.map(function (trigger) { return trigger.trigger.updatePosition(); });
        if (changes.filter(function (item) { return item; }).length) {
            this.onScroll();
        }
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
    Object.defineProperty(ScrollHandler.prototype, "scrollOverflow$", {
        get: function () {
            return this._scrollOverflow.asObservable();
        },
        enumerable: true,
        configurable: true
    });
    ScrollHandler.prototype.normalizePosition = function (position) {
        if (position < 0) {
            position = 0;
        }
        else if (this.horizontal && position > this.scrollSize.width) {
            position = this.scrollSize.width;
        }
        else if (!this.horizontal && position > this.scrollSize.height) {
            position = this.scrollSize.height;
        }
        return position;
    };
    ScrollHandler.prototype.preventScroll = function (delta) {
        var direction = delta != 0 ? delta / Math.abs(delta) : 0;
        var stickTo;
        for (var _i = 0, _a = this.triggerStates; _i < _a.length; _i++) {
            var state = _a[_i];
            var triggerPosition = this.getTriggerPosition(state.trigger);
            var triggerDelta = triggerPosition - this.position;
            var triggerDirection = triggerDelta != 0 ? triggerDelta / Math.abs(triggerDelta) : 0;
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
        this.scrollSourceHandlers.forEach(function (item) { return item.onStickTo(stickTo.position); });
        this.scrollTo(stickTo.position, stickTo.stick.duration, stickTo.stick.ease, false);
        stickTo.onSticked();
        return true;
    };
    ScrollHandler.prototype.getTriggerPosition = function (trigger) {
        return trigger.position;
    };
    ScrollHandler.prototype.updateTriggerState = function (trigger) {
        var triggerPosition = this.getTriggerPosition(trigger.trigger);
        if (this.instantPosition >= triggerPosition && !trigger.activated) {
            trigger.activated = true;
            trigger.trigger.onActivated({
                triggerPosition: triggerPosition,
                previousScrollPosition: this.previousScrollPosition,
                scrollPosition: this.instantPosition
            });
            return true;
        }
        else if (this.instantPosition < triggerPosition && trigger.activated) {
            trigger.activated = false;
            trigger.trigger.onDeactivated({
                triggerPosition: triggerPosition,
                previousScrollPosition: this.previousScrollPosition,
                scrollPosition: this.instantPosition
            });
            return true;
        }
        else {
            return false;
        }
    };
    ScrollHandler.prototype.updateTriggerStateForTrigger = function (trigger) {
        var state = this.triggerStates.find(function (item) { return item.trigger === trigger; });
        if (!state) {
            return;
        }
        return this.updateTriggerState(state);
    };
    ScrollHandler.prototype.onScroll = function () {
        var triggered = false;
        this.instantPosition = this.getInstantPosition();
        if (!this.overrideScroll) {
            this._position.next(this.instantPosition);
        }
        for (var _i = 0, _a = this.triggerStates; _i < _a.length; _i++) {
            var state = _a[_i];
            if (this.updateTriggerState(state)) {
                triggered = true;
            }
        }
        if (triggered) {
            this.updateContentSize();
        }
    };
    return ScrollHandler;
}());
exports.ScrollHandler = ScrollHandler;
//# sourceMappingURL=scroll-handler.js.map