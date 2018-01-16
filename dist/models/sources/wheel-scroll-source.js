"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Subject_1 = require("rxjs/Subject");
var WheelScrollSource = /** @class */ (function () {
    function WheelScrollSource(scrollHandler, zone) {
        this.scrollHandler = scrollHandler;
        this.zone = zone;
        this.subscriptions = [];
        this.wheelEventReleased = new Subject_1.Subject();
        this.wheelEventCaptured = false;
    }
    WheelScrollSource.prototype.bind = function () {
        var _this = this;
        this.subscriptions.push(this.wheelEventReleased.debounceTime(600).subscribe(function () { return _this.handleWheelReleaseEvent(); }));
        this.zone.runOutsideAngular(function () {
            if (_this.mouseWheelListener) {
                return;
            }
            _this.mouseWheelListener = function (e) {
                return _this.handleWheelEvent(e);
            };
            document.body.addEventListener('wheel', _this.mouseWheelListener);
        });
    };
    WheelScrollSource.prototype.unbind = function () {
        this.subscriptions.forEach(function (item) { return item.unsubscribe(); });
        if (this.mouseWheelListener) {
            document.body.removeEventListener('wheel', this.mouseWheelListener);
        }
    };
    WheelScrollSource.prototype.handleWheelEvent = function (e) {
        if (!this.scrollHandler.handleAllowed) {
            e.preventDefault();
            return false;
        }
        e.preventDefault();
        e.stopPropagation();
        if (this.wheelEventCaptured) {
            if (this.scrollHandler.animatingScroll) {
                this.wheelEventReleased.next(e);
            }
            return;
        }
        if (this.scrollHandler.animatingScroll) {
            return false;
        }
        var deltaX, deltaY;
        var speed = this.scrollHandler.speed;
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
        this.scrollHandler.handleScrollEvent(e, deltaX, deltaY, 0.16, undefined);
        return false;
    };
    WheelScrollSource.prototype.handleWheelReleaseEvent = function () {
        this.wheelEventCaptured = false;
    };
    WheelScrollSource.prototype.onStickTo = function (position) {
        this.wheelEventCaptured = true;
        this.wheelEventReleased.next();
    };
    return WheelScrollSource;
}());
exports.WheelScrollSource = WheelScrollSource;
//# sourceMappingURL=wheel-scroll-source.js.map