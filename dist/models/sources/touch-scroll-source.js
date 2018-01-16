"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var gsap_1 = require("gsap");
var TouchScrollSource = /** @class */ (function () {
    function TouchScrollSource(scrollHandler, zone) {
        this.scrollHandler = scrollHandler;
        this.zone = zone;
        this.touchMoves = [];
    }
    TouchScrollSource.prototype.bind = function () {
        var _this = this;
        this.zone.runOutsideAngular(function () {
            _this.touchStartListener = function (e) {
                return _this.handleTouchStartEvent(e);
            };
            _this.touchMoveListener = function (e) {
                return _this.handleTouchMoveEvent(e);
            };
            _this.touchEndListener = function (e) {
                return _this.handleTouchEndEvent(e);
            };
            document.body.addEventListener('touchstart', _this.touchStartListener);
            document.body.addEventListener('touchmove', _this.touchMoveListener);
            document.body.addEventListener('touchend', _this.touchEndListener);
        });
    };
    TouchScrollSource.prototype.unbind = function () {
        if (this.touchStartListener) {
            document.body.removeEventListener('touchstart', this.touchStartListener);
        }
        if (this.touchMoveListener) {
            document.body.removeEventListener('touchend', this.touchMoveListener);
        }
        if (this.touchEndListener) {
            document.body.removeEventListener('touchmove', this.touchEndListener);
        }
    };
    TouchScrollSource.prototype.handleTouchStartEvent = function (e) {
        if (!this.scrollHandler.handleAllowed) {
            return false;
        }
        e.stopPropagation();
        if (this.scrollHandler.animatingScroll) {
            return false;
        }
        this.lastTouch = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        this.touchMoves = [];
        return false;
    };
    TouchScrollSource.prototype.handleTouchMoveEvent = function (e) {
        if (!this.scrollHandler.handleAllowed) {
            return false;
        }
        e.preventDefault();
        e.stopPropagation();
        if (this.scrollHandler.animatingScroll) {
            return false;
        }
        var touch = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        if (this.lastTouch !== undefined) {
            var speed = this.scrollHandler.speed;
            var deltaX = Math.round(this.lastTouch.x - touch.x) * speed;
            var deltaY = Math.round(this.lastTouch.y - touch.y) * speed;
            this.scrollHandler.handleScrollEvent(e, deltaX, deltaY, 0, undefined);
            this.touchMoves.push({
                date: new Date(),
                deltaX: deltaX,
                deltaY: deltaY
            });
        }
        this.lastTouch = touch;
    };
    TouchScrollSource.prototype.handleTouchEndEvent = function (e) {
        if (!this.scrollHandler.handleAllowed) {
            return false;
        }
        this.lastTouch = undefined;
        if (this.scrollHandler.animatingScroll) {
            return false;
        }
        this.handleTouchEndInertia(e, this.touchMoves);
    };
    TouchScrollSource.prototype.handleTouchEndInertia = function (e, touches) {
        var a = 220; // duration
        var b = 0.1; // decrease
        var c = 7.5; // amplitude
        var ease = function (x) {
            if (x > a) {
                return 0;
            }
            else if (x <= 0) {
                return 1;
            }
            else {
                var f = function (x, a, b) { return (Math.acos(b * 2 / a * x - 1) / Math.PI); };
                return c * f(x, a, 1) / f(x, a, b);
            }
        };
        var result = touches.map(function (item) {
            var now = new Date();
            var multiply = ease(now - item.date);
            return {
                deltaX: item.deltaX * multiply,
                deltaY: item.deltaY * multiply
            };
        }).reduce(function (sum, item) {
            return {
                deltaX: sum.deltaX + item.deltaX,
                deltaY: sum.deltaY + item.deltaY
            };
        }, {
            deltaX: 0,
            deltaY: 0
        });
        var delta = Math.abs(result.deltaX) + Math.abs(result.deltaY);
        var duration = 0.16 * 3 * delta / 150;
        this.scrollHandler.handleScrollEvent(e, result.deltaX, result.deltaY, duration, gsap_1.Power4.easeOut);
    };
    TouchScrollSource.prototype.onStickTo = function (position) { };
    return TouchScrollSource;
}());
exports.TouchScrollSource = TouchScrollSource;
//# sourceMappingURL=touch-scroll-source.js.map