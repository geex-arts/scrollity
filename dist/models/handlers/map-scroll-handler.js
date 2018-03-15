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
var Subject_1 = require("rxjs/Subject");
var BehaviorSubject_1 = require("rxjs/BehaviorSubject");
var _ = require("lodash");
var scroll_handler_1 = require("./scroll-handler");
var MapScrollHandler = /** @class */ (function (_super) {
    __extends(MapScrollHandler, _super);
    function MapScrollHandler(scrollMap, options) {
        var _this = _super.call(this, options) || this;
        _this._scrollMapPosition = new BehaviorSubject_1.BehaviorSubject(undefined);
        _this.scrollMapItemPositions = [];
        _this.scrollMap = scrollMap;
        return _this;
    }
    Object.defineProperty(MapScrollHandler.prototype, "scrollMap", {
        set: function (scrollMap) {
            this._scrollMap = scrollMap;
            this.setInitialPosition();
        },
        enumerable: true,
        configurable: true
    });
    MapScrollHandler.prototype.getInstantPosition = function () {
        return this.element.scrollLeft + this.element.scrollTop;
    };
    MapScrollHandler.prototype.handleResizeEvent = function () {
        _super.prototype.handleResizeEvent.call(this);
        this.updateScrollMapItems();
        this.updateScrollMapItemPositions();
    };
    MapScrollHandler.prototype.handleScrollEvent = function (e, deltaX, deltaY, duration, ease) {
        var _this = this;
        if (ease === void 0) { ease = undefined; }
        var delta = deltaX + deltaY;
        if (this.preventScroll(delta)) {
            return;
        }
        var totalDistance = this._scrollMap
            .map(function (item) { return item.getDistance(_this.viewportSize); })
            .reduce(function (sum, current) { return sum + current; });
        var estimatedPosition = this.instantPosition + delta;
        var position;
        if (estimatedPosition < 0) {
            position = 0;
        }
        else if (estimatedPosition > totalDistance) {
            position = totalDistance;
        }
        else {
            position = estimatedPosition;
        }
        this.scrollTo(position, duration, ease, true);
        if (estimatedPosition > position) {
            this._scrollOverflow.next(estimatedPosition - position);
        }
        else if (estimatedPosition < 0) {
            this._scrollOverflow.next(estimatedPosition);
        }
    };
    MapScrollHandler.prototype.scrollTo = function (position, duration, ease, cancellable) {
        var _this = this;
        if (ease === void 0) { ease = undefined; }
        if (cancellable === void 0) { cancellable = false; }
        if (position === undefined) {
            return Observable_1.Observable.of({});
        }
        if (!cancellable) {
            this.animatingScroll = true;
        }
        var mapPosition = this.calculateScrollMapPosition(position);
        var params = {
            scrollTo: {
                x: mapPosition.x,
                y: mapPosition.y
            }
        };
        var obs = new Subject_1.Subject();
        if (ease) {
            params['ease'] = ease;
        }
        params['onComplete'] = function () {
            obs.next();
            if (!cancellable) {
                _this.animatingScroll = false;
            }
        };
        this.previousScrollPosition = this.position;
        if (this._position.value != position) {
            this._position.next(position);
        }
        if (this._scrollMapPosition.value == undefined
            || this._scrollMapPosition.value.x !== mapPosition.x
            || this._scrollMapPosition.value.y !== mapPosition.y) {
            this._scrollMapPosition.next(mapPosition);
        }
        if (duration) {
            this.timeline = this.timeline.clear().to(this.element, duration, params);
        }
        else {
            this.timeline = this.timeline.clear().set(this.element, params);
        }
        return obs;
    };
    MapScrollHandler.prototype.calculateScrollMapPosition = function (position) {
        var _this = this;
        var mapDistance = 0;
        var mapPosition = { x: 0, y: 0 };
        this._scrollMap.forEach(function (item) {
            var distance = item.getDistance(_this.viewportSize);
            var percentage = (position - mapDistance) / distance;
            var insidePosition = item.getPosition(_this.viewportSize, percentage);
            if (distance >= 0) {
                mapDistance += distance;
            }
            mapPosition.x += insidePosition.x;
            mapPosition.y += insidePosition.y;
            if (percentage >= 0 && percentage < 1) {
                return false;
            }
        });
        return mapPosition;
    };
    MapScrollHandler.prototype.updateScrollMapItems = function () {
        if (!this._scrollMap) {
            return;
        }
        this._scrollMap.forEach(function (item) { return item.onLayoutUpdated(); });
    };
    Object.defineProperty(MapScrollHandler.prototype, "scrollMapPosition", {
        get: function () {
            return this._scrollMapPosition.asObservable();
        },
        enumerable: true,
        configurable: true
    });
    MapScrollHandler.prototype.updateScrollMapItemPositions = function () {
        var _this = this;
        var sum = 0;
        this.scrollMapItemPositions = this._scrollMap.map(function (item) {
            var distance = item.getDistance(_this.viewportSize);
            var obj = {
                startPosition: sum,
                endPosition: sum + distance,
                item: item
            };
            sum += distance;
            return obj;
        });
    };
    MapScrollHandler.prototype.getTriggerPosition = function (trigger) {
        var triggerPosition = _super.prototype.getTriggerPosition.call(this, trigger);
        var scrollMapItem = _.first(this.scrollMapItemPositions.filter(function (item) { return item.item === trigger.scrollMapItem; }));
        if (scrollMapItem) {
            triggerPosition += scrollMapItem.startPosition;
        }
        return triggerPosition;
    };
    return MapScrollHandler;
}(scroll_handler_1.ScrollHandler));
exports.MapScrollHandler = MapScrollHandler;
//# sourceMappingURL=map-scroll-handler.js.map