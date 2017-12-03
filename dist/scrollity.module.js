"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var common_1 = require("@angular/common");
if (common_1.isPlatformBrowser(core_1.PLATFORM_ID)) {
    var global = this || {};
    global['window'] = global['window'] || {};
    global['window']['_gsQueue'] = global['window']['_gsDefine'] = null;
    global['window']['GreenSockGlobals'] = {};
}
var core_2 = require("@angular/core");
var common_2 = require("@angular/common");
require("rxjs/Rx");
require("gsap");
var scroll_service_1 = require("./services/scroll.service");
var scroll_trigger_directive_1 = require("./directives/scroll-trigger/scroll-trigger.directive");
var scrollTriggered_pipe_1 = require("./pipes/scrollTriggered.pipe");
var document_service_1 = require("./services/document.service");
var ScrollityModule = /** @class */ (function () {
    function ScrollityModule() {
    }
    ScrollityModule.decorators = [
        { type: core_2.NgModule, args: [{
                    imports: [
                        common_2.CommonModule
                    ],
                    declarations: [
                        scroll_trigger_directive_1.ScrollTriggerDirective,
                        scrollTriggered_pipe_1.ScrollTriggeredPipe
                    ],
                    providers: [
                        scroll_service_1.ScrollService,
                        document_service_1.DocumentService
                    ],
                    exports: [
                        scroll_trigger_directive_1.ScrollTriggerDirective,
                        scrollTriggered_pipe_1.ScrollTriggeredPipe
                    ]
                },] },
    ];
    /** @nocollapse */
    ScrollityModule.ctorParameters = function () { return []; };
    return ScrollityModule;
}());
exports.ScrollityModule = ScrollityModule;
//# sourceMappingURL=scrollity.module.js.map