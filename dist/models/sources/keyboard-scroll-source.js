"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Observable_1 = require("rxjs/Observable");
var KeyboardScrollSource = /** @class */ (function () {
    function KeyboardScrollSource(scrollHandler, zone) {
        this.scrollHandler = scrollHandler;
        this.zone = zone;
        this.subscriptions = [];
    }
    KeyboardScrollSource.prototype.bind = function () {
        var _this = this;
        this.zone.runOutsideAngular(function () {
            Observable_1.Observable.fromEvent(document, 'keyup')
                .subscribe(function (e) { return _this.handleKeyboardEvent(e); });
        });
    };
    KeyboardScrollSource.prototype.unbind = function () {
        this.subscriptions.forEach(function (item) { return item.unsubscribe(); });
    };
    KeyboardScrollSource.prototype.handleKeyboardEvent = function (e) {
        var KEY_CODE_DELTAS = {
            32: { x: 0, y: window.innerHeight },
            37: { x: -20, y: 0 },
            38: { x: 0, y: -20 },
            39: { x: 20, y: 0 },
            40: { x: 0, y: 20 }
        };
        if (!KEY_CODE_DELTAS[e.keyCode]) {
            return;
        }
        if (!this.scrollHandler.handleAllowed) {
            e.preventDefault();
            return false;
        }
        e.preventDefault();
        e.stopPropagation();
        if (this.scrollHandler.animatingScroll) {
            return false;
        }
        var delta = KEY_CODE_DELTAS[e.keyCode];
        this.scrollHandler.handleScrollEvent(e, delta.x, delta.y, 0.16, undefined);
        return false;
    };
    KeyboardScrollSource.prototype.onStickTo = function (position) { };
    return KeyboardScrollSource;
}());
exports.KeyboardScrollSource = KeyboardScrollSource;
//# sourceMappingURL=keyboard-scroll-source.js.map