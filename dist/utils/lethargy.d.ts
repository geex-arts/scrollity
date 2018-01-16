export declare class Lethargy {
    private stability;
    private sensitivity;
    private tolerance;
    private delay;
    lastUpDeltas: any[];
    lastDownDeltas: any[];
    deltasTimestamp: any[];
    createInitialDeltas(): any[];
    constructor(stability?: number, sensitivity?: number, tolerance?: number, delay?: number);
    check(e: any): any;
    isInertia(direction: any): any;
}
