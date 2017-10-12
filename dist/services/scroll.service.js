"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var _ = require("lodash");
var ScrollService = /** @class */ (function () {
    function ScrollService(zone) {
        this.zone = zone;
        this.handlers = [];
    }
    ScrollService.prototype.addScrollHandler = function (owner, handler) {
        handler.service = this;
        handler.zone = this.zone;
        handler.onInit();
        this.handlers.push({ owner: owner, handler: handler });
        handler.bind();
        return handler;
    };
    ScrollService.prototype.removeScrollHandler = function (owner) {
        var documentScrollHandler = _.last(this.handlers.filter(function (item) { return item.owner === owner; }));
        if (documentScrollHandler) {
            documentScrollHandler.handler.unbind();
        }
        this.handlers = this.handlers.filter(function (item) { return item !== documentScrollHandler; });
    };
    ScrollService.prototype.handleAllowed = function (handler) {
        var last = _.last(this.handlers);
        return last && last.handler === handler;
    };
    ScrollService.prototype.scrollTo = function (position, duration, ease, cancellable) {
        if (ease === void 0) { ease = undefined; }
        if (cancellable === void 0) { cancellable = false; }
        var last = _.last(this.handlers);
        if (!last) {
            return;
        }
        return last.handler.scrollTo(position, duration, ease, cancellable);
    };
    Object.defineProperty(ScrollService.prototype, "position", {
        get: function () {
            var last = _.last(this.handlers);
            if (!last) {
                return;
            }
            return last.handler.position;
        },
        enumerable: true,
        configurable: true
    });
    ScrollService.decorators = [
        { type: core_1.Injectable },
    ];
    /** @nocollapse */
    ScrollService.ctorParameters = function () { return [
        { type: core_1.NgZone, },
    ]; };
    return ScrollService;
}());
exports.ScrollService = ScrollService;
//# sourceMappingURL=scroll.service.js.map