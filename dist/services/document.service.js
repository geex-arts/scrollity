"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var DocumentService = /** @class */ (function () {
    function DocumentService() {
    }
    DocumentService.prototype.getOffset = function (element, relativeTo) {
        if (relativeTo === void 0) { relativeTo = null; }
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
    DocumentService.decorators = [
        { type: core_1.Injectable },
    ];
    /** @nocollapse */
    DocumentService.ctorParameters = function () { return []; };
    return DocumentService;
}());
exports.DocumentService = DocumentService;
//# sourceMappingURL=document.service.js.map