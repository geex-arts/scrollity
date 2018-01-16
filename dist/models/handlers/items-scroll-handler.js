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
var scroll_handler_1 = require("./scroll-handler");
var lethargy_1 = require("../../utils/lethargy");
var ItemsScrollHandler = /** @class */ (function (_super) {
    __extends(ItemsScrollHandler, _super);
    function ItemsScrollHandler(itemSize, itemsCount, options) {
        var _this = _super.call(this, options) || this;
        _this.handleScrollProcessing = false;
        _this.lethargy = new lethargy_1.Lethargy();
        _this.itemSize = itemSize;
        _this.itemsCount = itemsCount;
        return _this;
    }
    ItemsScrollHandler.prototype.getInstantPosition = function () {
        return this.position;
    };
    ItemsScrollHandler.prototype.handleScrollEvent = function (e, deltaX, deltaY, duration, ease) {
        var _this = this;
        if (ease === void 0) { ease = undefined; }
        if (e.type == 'wheel' && this.lethargy.check(e) == false) {
            return;
        }
        if (this.handleScrollProcessing) {
            return;
        }
        var delta = deltaX + deltaY;
        var position;
        if (delta >= this.itemSize && this.position < this.itemsCount - 1) {
            position = this.position + 1;
        }
        else if (delta <= 0 - this.itemSize && this.position > 0) {
            position = this.position - 1;
        }
        if (position != undefined) {
            this.handleScrollProcessing = true;
            this.scrollTo(position, duration, ease, false);
            setTimeout(function () { return _this.handleScrollProcessing = false; }, 600);
        }
    };
    ItemsScrollHandler.prototype.scrollTo = function (position, duration, ease, cancellable) {
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
        var obs = Observable_1.Observable.of([{}]).delay(duration);
        obs.subscribe(function () { return _this.animatingScroll = false; });
        return obs;
    };
    return ItemsScrollHandler;
}(scroll_handler_1.ScrollHandler));
exports.ItemsScrollHandler = ItemsScrollHandler;
//# sourceMappingURL=items-scroll-handler.js.map