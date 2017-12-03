"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var ScrollTriggeredPipe = /** @class */ (function () {
    function ScrollTriggeredPipe() {
    }
    ScrollTriggeredPipe.prototype.transform = function (scrollHandler, element) {
        if (!scrollHandler) {
            return;
        }
        var trigger = scrollHandler.triggerStates.find(function (item) { return item.trigger.element == element; });
        return trigger ? trigger.activated : false;
    };
    ScrollTriggeredPipe.decorators = [
        { type: core_1.Pipe, args: [{
                    name: 'scrollTriggered',
                    pure: false
                },] },
    ];
    /** @nocollapse */
    ScrollTriggeredPipe.ctorParameters = function () { return []; };
    return ScrollTriggeredPipe;
}());
exports.ScrollTriggeredPipe = ScrollTriggeredPipe;
//# sourceMappingURL=scrollTriggered.pipe.js.map