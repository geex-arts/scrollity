"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var BehaviorSubject_1 = require("rxjs/BehaviorSubject");
var gsap_1 = require("gsap");
var touch_scroll_source_1 = require("../sources/touch-scroll-source");
var wheel_scroll_source_1 = require("../sources/wheel-scroll-source");
var Subject_1 = require("rxjs/Subject");
var ScrollHandler = /** @class */ (function () {
    function ScrollHandler(options) {
        this.enabled = true;
        this.timeline = new gsap_1.TimelineMax();
        this.animatingScroll = false;
        this.instantPosition = 0;
        this._position = new BehaviorSubject_1.BehaviorSubject(0);
        this._scrollMapPosition = new BehaviorSubject_1.BehaviorSubject(undefined);
        this.triggers = [];
        this.previousScrollPosition = 0;
        this.scrollSourceHandlers = [];
        this._scrollOverflow = new Subject_1.Subject();
        this.element = options.element;
        this.horizontal = options.horizontal || false;
        this.translate = options.translate || false;
        this.initialPosition = options.initialPosition || 0;
        this.viewport = options.viewport || this.element;
        this.overrideScroll = options.overrideScroll || true;
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
            _this.viewport.addEventListener('scroll', _this.scrollListener);
            window.addEventListener('resize', _this.resizeListener);
        });
        this.scrollSourceHandlers.forEach(function (item) { return item.bind(); });
    };
    ScrollHandler.prototype.unbind = function () {
        if (this.scrollListener) {
            this.viewport.removeEventListener('scroll', this.scrollListener);
        }
        if (this.resizeListener) {
            window.removeEventListener('resize', this.resizeListener);
        }
        this.scrollSourceHandlers.forEach(function (item) { return item.unbind(); });
    };
    ScrollHandler.prototype.handleScrollEndEvent = function () {
        this.onScroll();
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
        else if (this.horizontal && position > this.contentSize.width - this.viewportSize.width) {
            position = this.contentSize.width - this.viewportSize.width;
        }
        else if (!this.horizontal && position > this.contentSize.height - this.viewportSize.height) {
            position = this.contentSize.height - this.viewportSize.height;
        }
        return position;
    };
    ScrollHandler.prototype.preventScroll = function (delta) {
        var direction = delta != 0 ? delta / Math.abs(delta) : 0;
        var stickTo;
        for (var _i = 0, _a = this.triggers; _i < _a.length; _i++) {
            var trigger = _a[_i];
            var triggerPosition = this.getTriggerPosition(trigger.trigger);
            var triggerDelta = triggerPosition - this.position;
            var triggerDirection = triggerDelta != 0 ? triggerDelta / Math.abs(triggerDelta) : 0;
            if (trigger.trigger.stick != undefined
                && triggerDirection == direction
                && this.previousStickTo != trigger.trigger
                && Math.abs(triggerPosition - this.position) <= this.viewportSize.width + trigger.trigger.stick
                && (!stickTo || Math.abs(stickTo.position - this.position) > Math.abs(triggerDelta))) {
                stickTo = trigger.trigger;
            }
        }
        if (stickTo) {
            this.previousStickTo = stickTo;
            this.scrollSourceHandlers.forEach(function (item) { return item.onStickTo(stickTo.position); });
            this.scrollTo(stickTo.position, 0.9, undefined, false);
            return true;
        }
        return false;
    };
    ScrollHandler.prototype.getTriggerPosition = function (trigger) {
        return trigger.position;
    };
    ScrollHandler.prototype.onScroll = function () {
        var triggered = false;
        this.instantPosition = this.getInstantPosition();
        for (var _i = 0, _a = this.triggers; _i < _a.length; _i++) {
            var trigger = _a[_i];
            var triggerPosition = this.getTriggerPosition(trigger.trigger);
            if (this.position >= triggerPosition && !trigger.activated) {
                trigger.activated = true;
                trigger.trigger.onActivated({
                    triggerPosition: triggerPosition,
                    previousScrollPosition: this.previousScrollPosition,
                    scrollPosition: this.position
                });
                triggered = true;
            }
            else if (this.position < triggerPosition && trigger.activated) {
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
    };
    return ScrollHandler;
}());
exports.ScrollHandler = ScrollHandler;
//# sourceMappingURL=scroll-handler.js.map