import { ScrollMapItem, ScrollPosition, ViewportSize } from './scroll-map-item';
export declare type LineScrollMapItemOptions = {
    x?: number;
    y?: number;
    xScreen?: number;
    yScreen?: number;
};
export declare class LineScrollMapItem implements ScrollMapItem {
    x: number;
    y: number;
    xScreen: number;
    yScreen: number;
    constructor(options: LineScrollMapItemOptions);
    getDistance(viewportSize: ViewportSize): number;
    getPosition(viewportSize: ViewportSize, progress: number): ScrollPosition;
    getElementScrollPosition(_: HTMLElement): number;
    getDirection(): number;
    onLayoutUpdated(): void;
}
