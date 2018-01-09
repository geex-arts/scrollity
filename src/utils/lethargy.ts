
export class Lethargy {
  lastUpDeltas = [];
  lastDownDeltas = [];
  deltasTimestamp = [];

  createInitialDeltas() {
    const results = [];

    for (let i = 1, ref = this.stability * 2; 1 <= ref ? i <= ref : i >= ref; 1 <= ref ? i++ : i--) {
      results.push(null);
    }

    return results;
  }

  constructor(private stability = 8,
              private sensitivity = 100,
              private tolerance = 1.1,
              private delay = 150) {
    this.lastUpDeltas = this.createInitialDeltas();
    this.lastDownDeltas = this.createInitialDeltas();
    this.deltasTimestamp = this.createInitialDeltas();
  }

  check(e) {
    let lastDelta;

    e = e.originalEvent || e;

    if (e.wheelDelta != null) {
      lastDelta = e.wheelDelta;
    } else if (e.deltaY != null) {
      lastDelta = e.deltaY * -40;
    } else if ((e.detail != null) || e.detail === 0) {
      lastDelta = e.detail * -40;
    }

    this.deltasTimestamp.push(Date.now());
    this.deltasTimestamp.shift();

    if (lastDelta > 0) {
      this.lastUpDeltas.push(lastDelta);
      this.lastUpDeltas.shift();
      return this.isInertia(1);
    } else {
      this.lastDownDeltas.push(lastDelta);
      this.lastDownDeltas.shift();
      return this.isInertia(-1);
    }
  }

  isInertia(direction) {
    const lastDeltas = direction === -1 ? this.lastDownDeltas : this.lastUpDeltas;

    if (lastDeltas[0] === null) {
      return direction;
    }

    if (this.deltasTimestamp[(this.stability * 2) - 2] + this.delay > Date.now() && lastDeltas[0] === lastDeltas[(this.stability * 2) - 1]) {
      return false;
    }

    const lastDeltasOld = lastDeltas.slice(0, this.stability);
    const lastDeltasNew = lastDeltas.slice(this.stability, this.stability * 2);
    const oldSum = lastDeltasOld.reduce((t, s) => t + s, 0);
    const newSum = lastDeltasNew.reduce((t, s) => t + s, 0);
    const oldAverage = oldSum / lastDeltasOld.length;
    const newAverage = newSum / lastDeltasNew.length;

    if (Math.abs(oldAverage) < Math.abs(newAverage * this.tolerance) && (this.sensitivity < Math.abs(newAverage))) {
      return direction;
    } else {
      return false;
    }
  }
}
