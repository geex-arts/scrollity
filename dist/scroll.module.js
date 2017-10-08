"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var common_1 = require("@angular/common");
window['_gsQueue'] = window['_gsDefine'] = null;
window['GreenSockGlobals'] = {};
var scroll_service_1 = require("./services/scroll.service");
var scroll_trigger_directive_1 = require("./directives/scroll-trigger/scroll-trigger.directive");
var scrollTriggered_pipe_1 = require("./pipes/scrollTriggered.pipe");
var document_service_1 = require("./services/document.service");
var ScrollModule = /** @class */ (function () {
    function ScrollModule() {
    }
    ScrollModule.decorators = [
        { type: core_1.NgModule, args: [{
                    imports: [
                        common_1.CommonModule
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
    ScrollModule.ctorParameters = function () { return []; };
    return ScrollModule;
}());
exports.ScrollModule = ScrollModule;
//# sourceMappingURL=scroll.module.js.map