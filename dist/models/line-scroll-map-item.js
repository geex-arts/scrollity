"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var LineScrollMapItem = /** @class */ (function () {
    function LineScrollMapItem(options) {
        this.x = options.x || 0;
        this.y = options.y || 0;
        this.xScreen = options.xScreen || 0;
        this.yScreen = options.yScreen || 0;
    }
    LineScrollMapItem.prototype.getDistance = function (viewportSize) {
        return Math.abs(this.x)
            + Math.abs(this.y)
            + Math.abs(this.xScreen) * viewportSize.width
            + Math.abs(this.yScreen) * viewportSize.height;
    };
    LineScrollMapItem.prototype.getPosition = function (viewportSize, progress) {
        if (progress > 1) {
            progress = 1;
        }
        else if (progress < 0) {
            progress = 0;
        }
        return {
            x: (this.x + this.xScreen * viewportSize.width) * progress,
            y: (this.y + this.yScreen * viewportSize.height) * progress
        };
    };
    LineScrollMapItem.prototype.getElementScrollPosition = function (_) {
        return undefined;
    };
    LineScrollMapItem.prototype.getDirection = function () {
        return this.y > 0 || this.yScreen > 0 ? 90 : 180;
    };
    LineScrollMapItem.prototype.onLayoutUpdated = function () {
    };
    return LineScrollMapItem;
}());
exports.LineScrollMapItem = LineScrollMapItem;
//# sourceMappingURL=line-scroll-map-item.js.map