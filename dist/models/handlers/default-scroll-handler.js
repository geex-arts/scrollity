"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var Observable_1 = require("rxjs/Observable");
var Subject_1 = require("rxjs/Subject");
var scroll_handler_1 = require("./scroll-handler");
var DefaultScrollHandler = /** @class */ (function (_super) {
    __extends(DefaultScrollHandler, _super);
    function DefaultScrollHandler() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    DefaultScrollHandler.prototype.getInstantPosition = function () {
        return this.horizontal ? this.element.scrollLeft : this.element.scrollTop;
    };
    DefaultScrollHandler.prototype.handleScrollEvent = function (deltaX, deltaY, duration, ease) {
        if (ease === void 0) { ease = undefined; }
        var delta = deltaX + deltaY;
        if (this.preventScroll(delta)) {
            return;
        }
        var estimatedPosition = this._position.value + delta;
        var position = this.normalizePosition(estimatedPosition);
        this.scrollTo(position, duration, ease, true);
        if (estimatedPosition > position) {
            this._scrollOverflow.next(estimatedPosition - position);
        }
        else if (estimatedPosition < 0) {
            this._scrollOverflow.next(estimatedPosition);
        }
    };
    DefaultScrollHandler.prototype.scrollTo = function (position, duration, ease, cancellable) {
        var _this = this;
        if (ease === void 0) { ease = undefined; }
        if (cancellable === void 0) { cancellable = false; }
        if (!cancellable) {
            this.animatingScroll = true;
        }
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
            params = this.horizontal ? { scrollTo: { x: position } } : { scrollTo: { y: position } };
        }
        if (ease) {
            params['ease'] = ease;
        }
        params['onComplete'] = function () {
            obs.next();
            if (!cancellable) {
                _this.animatingScroll = false;
            }
        };
        obs.subscribe(function () {
            position = _this._position.value;
            if (position > _this.getInstantPosition()) {
                _this.updateContentSize();
            }
        });
        if (duration) {
            this.timeline = this.timeline.clear().to(this.element, duration, params);
        }
        else {
            this.timeline = this.timeline.clear().set(this.element, params);
            return Observable_1.Observable.of({});
        }
        return obs;
    };
    return DefaultScrollHandler;
}(scroll_handler_1.ScrollHandler));
exports.DefaultScrollHandler = DefaultScrollHandler;
//# sourceMappingURL=default-scroll-handler.js.map