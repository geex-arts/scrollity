"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Lethargy = /** @class */ (function () {
    function Lethargy(stability, sensitivity, tolerance, delay) {
        if (stability === void 0) { stability = 8; }
        if (sensitivity === void 0) { sensitivity = 100; }
        if (tolerance === void 0) { tolerance = 1.1; }
        if (delay === void 0) { delay = 150; }
        this.stability = stability;
        this.sensitivity = sensitivity;
        this.tolerance = tolerance;
        this.delay = delay;
        this.lastUpDeltas = [];
        this.lastDownDeltas = [];
        this.deltasTimestamp = [];
        this.lastUpDeltas = this.createInitialDeltas();
        this.lastDownDeltas = this.createInitialDeltas();
        this.deltasTimestamp = this.createInitialDeltas();
    }
    Lethargy.prototype.createInitialDeltas = function () {
        var results = [];
        for (var i = 1, ref = this.stability * 2; 1 <= ref ? i <= ref : i >= ref; 1 <= ref ? i++ : i--) {
            results.push(null);
        }
        return results;
    };
    Lethargy.prototype.check = function (e) {
        var lastDelta;
        e = e.originalEvent || e;
        if (e.wheelDelta != null) {
            lastDelta = e.wheelDelta;
        }
        else if (e.deltaY != null) {
            lastDelta = e.deltaY * -40;
        }
        else if ((e.detail != null) || e.detail === 0) {
            lastDelta = e.detail * -40;
        }
        this.deltasTimestamp.push(Date.now());
        this.deltasTimestamp.shift();
        if (lastDelta > 0) {
            this.lastUpDeltas.push(lastDelta);
            this.lastUpDeltas.shift();
            return this.isInertia(1);
        }
        else {
            this.lastDownDeltas.push(lastDelta);
            this.lastDownDeltas.shift();
            return this.isInertia(-1);
        }
    };
    Lethargy.prototype.isInertia = function (direction) {
        var lastDeltas = direction === -1 ? this.lastDownDeltas : this.lastUpDeltas;
        if (lastDeltas[0] === null) {
            return direction;
        }
        if (this.deltasTimestamp[(this.stability * 2) - 2] + this.delay > Date.now() && lastDeltas[0] === lastDeltas[(this.stability * 2) - 1]) {
            return false;
        }
        var lastDeltasOld = lastDeltas.slice(0, this.stability);
        var lastDeltasNew = lastDeltas.slice(this.stability, this.stability * 2);
        var oldSum = lastDeltasOld.reduce(function (t, s) { return t + s; }, 0);
        var newSum = lastDeltasNew.reduce(function (t, s) { return t + s; }, 0);
        var oldAverage = oldSum / lastDeltasOld.length;
        var newAverage = newSum / lastDeltasNew.length;
        if (Math.abs(oldAverage) < Math.abs(newAverage * this.tolerance) && (this.sensitivity < Math.abs(newAverage))) {
            return direction;
        }
        else {
            return false;
        }
    };
    return Lethargy;
}());
exports.Lethargy = Lethargy;
//# sourceMappingURL=lethargy.js.map