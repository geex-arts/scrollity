"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ElementScrollMapItem = /** @class */ (function () {
    function ElementScrollMapItem(options) {
        this.element = options.element;
        this.horizontal = options.horizontal || false;
        this.scrollToDisappear = options.scrollToDisappear || false;
    }
    ElementScrollMapItem.prototype.outerWidth = function (element) {
        var result = this.element.offsetWidth;
        result += parseInt(window.getComputedStyle(element).getPropertyValue('margin-left'), 10);
        result += parseInt(window.getComputedStyle(element).getPropertyValue('margin-right'), 10);
        return result;
    };
    ElementScrollMapItem.prototype.outerHeight = function (element) {
        var result = this.element.offsetHeight;
        result += parseInt(window.getComputedStyle(element).getPropertyValue('margin-top'), 10);
        result += parseInt(window.getComputedStyle(element).getPropertyValue('margin-bottom'), 10);
        return result;
    };
    ElementScrollMapItem.prototype.getDistance = function (viewportSize) {
        if (this.cachedDistance !== undefined) {
            return this.cachedDistance;
        }
        var value;
        if (this.scrollToDisappear) {
            value = this.horizontal
                ? this.outerWidth(this.element)
                : this.outerHeight(this.element);
        }
        else {
            value = this.horizontal
                ? this.outerWidth(this.element) - viewportSize.width
                : this.outerHeight(this.element) - viewportSize.height;
        }
        this.cachedDistance = value;
        return value;
    };
    ElementScrollMapItem.prototype.getPosition = function (viewportSize, progress) {
        if (progress > 1) {
            progress = 1;
        }
        else if (progress < 0) {
            progress = 0;
        }
        return this.horizontal ? {
            x: this.getDistance(viewportSize) * progress,
            y: 0
        } : {
            x: 0,
            y: this.getDistance(viewportSize) * progress
        };
    };
    ElementScrollMapItem.prototype.getElementScrollPosition = function (element) {
        return this.horizontal
            ? this.getElementOffset(element).left - this.getElementOffset(this.element).left
            : this.getElementOffset(element).top - this.getElementOffset(this.element).top;
    };
    ElementScrollMapItem.prototype.getDirection = function () {
        return this.horizontal ? 90 : 180;
    };
    ElementScrollMapItem.prototype.getElementOffset = function (element, relativeTo) {
        if (relativeTo === void 0) { relativeTo = undefined; }
        var x = 0;
        var y = 0;
        while (element && !isNaN(element.offsetLeft) && !isNaN(element.offsetTop)) {
            x += element.offsetLeft - element.scrollLeft;
            y += element.offsetTop - element.scrollTop;
            element = element.offsetParent;
            if (relativeTo && element == relativeTo) {
                break;
            }
        }
        return { top: y, left: x };
    };
    ElementScrollMapItem.prototype.onLayoutUpdated = function () {
        this.cachedDistance = undefined;
    };
    return ElementScrollMapItem;
}());
exports.ElementScrollMapItem = ElementScrollMapItem;
//# sourceMappingURL=element-scroll-map-item.js.map