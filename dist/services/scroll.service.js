"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var _ = require("lodash");
var scroll_handler_1 = require("../models/scroll-handler");
var ScrollService = /** @class */ (function () {
    function ScrollService(zone) {
        this.zone = zone;
        this.handlers = [];
    }
    ScrollService.prototype.addScrollHandler = function (owner, element, options) {
        if (options === void 0) { options = {}; }
        var handler = new scroll_handler_1.ScrollHandler(this, element, this.zone, options);
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
    ScrollService.prototype.scrollTo = function (position, duration, ease) {
        if (ease === void 0) { ease = undefined; }
        var last = _.last(this.handlers);
        if (!last) {
            return;
        }
        return last.handler.scrollTo(position, duration, ease);
    };
    ScrollService.prototype.scrollPosition = function () {
        var last = _.last(this.handlers);
        if (!last) {
            return;
        }
        return last.handler.scrollPosition();
    };
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