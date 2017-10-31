"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var document_service_1 = require("../../services/document.service");
var ScrollTriggerDirective = /** @class */ (function () {
    function ScrollTriggerDirective(el, documentService) {
        this.el = el;
        this.documentService = documentService;
        this.triggerActivated = new core_1.EventEmitter();
        this.triggerDeactivated = new core_1.EventEmitter();
        this.triggerPassed = new core_1.EventEmitter();
    }
    ScrollTriggerDirective.prototype.ngOnChanges = function (changes) {
        var options = changes['options'].currentValue;
        if (!options) {
            if (this.handler) {
                this.handler.removeTrigger(this);
                this.handler = undefined;
                this.elementTrigger = undefined;
                this.screenTrigger = undefined;
                this.offset = undefined;
                this.scrollMapItem = undefined;
                this.stick = undefined;
            }
            return;
        }
        if (!options.handler) {
            return;
        }
        this.handler = options.handler;
        this.elementTrigger = options.elementTrigger != undefined ? options.elementTrigger : 0;
        this.screenTrigger = options.screenTrigger != undefined ? options.screenTrigger : 0.5;
        this.offset = options.offset != undefined ? options.offset : 0;
        this.scrollMapItem = options.scrollMapItem;
        var stick = options.stick;
        if (stick != undefined) {
            stick.distance = stick['distance'] != undefined ? stick.distance : 0;
            stick.duration = stick['duration'] != undefined ? stick.duration : 1.2;
        }
        this.stick = stick;
        this.updatePosition();
        this.options.handler.addTrigger(this);
    };
    ScrollTriggerDirective.prototype.ngOnDestroy = function () {
        if (this.options.handler) {
            this.options.handler.removeTrigger(this);
        }
    };
    ScrollTriggerDirective.prototype.updatePosition = function () {
        if (!this.handler) {
            return;
        }
        var position;
        var horizontal = this.scrollMapItem ? this.scrollMapItem.getDirection() == 90 : this.handler.horizontal;
        if (this.scrollMapItem) {
            position = this.scrollMapItem.getElementScrollPosition(this.el.nativeElement);
        }
        else {
            position = horizontal
                ? this.documentService.getOffset(this.el.nativeElement, this.handler.element).left
                : this.documentService.getOffset(this.el.nativeElement, this.handler.element).top;
        }
        position += this.offset || 0;
        if (this.elementTrigger != 0) {
            position += horizontal
                ? this.elementTrigger * this.el.nativeElement.offsetWidth
                : this.elementTrigger * this.el.nativeElement.offsetHeight;
        }
        if (this.screenTrigger != 0) {
            position -= horizontal
                ? this.screenTrigger * this.handler.viewportSize.width
                : this.screenTrigger * this.handler.viewportSize.height;
        }
        if (this._position == position) {
            return false;
        }
        this._position = position;
        return true;
    };
    Object.defineProperty(ScrollTriggerDirective.prototype, "position", {
        get: function () {
            return this._position;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ScrollTriggerDirective.prototype, "element", {
        get: function () {
            return this.el.nativeElement;
        },
        enumerable: true,
        configurable: true
    });
    ScrollTriggerDirective.prototype.onActivated = function (event) {
        this.triggerActivated.emit(event);
        this.triggerPassed.emit(event);
    };
    ScrollTriggerDirective.prototype.onDeactivated = function (event) {
        this.triggerDeactivated.emit(event);
        this.triggerPassed.emit(event);
    };
    ScrollTriggerDirective.decorators = [
        { type: core_1.Directive, args: [{ selector: '[scroll-trigger]' },] },
    ];
    /** @nocollapse */
    ScrollTriggerDirective.ctorParameters = function () { return [
        { type: core_1.ElementRef, },
        { type: document_service_1.DocumentService, },
    ]; };
    ScrollTriggerDirective.propDecorators = {
        'options': [{ type: core_1.Input, args: ['scroll-trigger',] },],
        'triggerActivated': [{ type: core_1.Output, args: ['triggeractivated',] },],
        'triggerDeactivated': [{ type: core_1.Output, args: ['triggerdeactivated',] },],
        'triggerPassed': [{ type: core_1.Output, args: ['triggerpassed',] },],
    };
    return ScrollTriggerDirective;
}());
exports.ScrollTriggerDirective = ScrollTriggerDirective;
//# sourceMappingURL=scroll-trigger.directive.js.map