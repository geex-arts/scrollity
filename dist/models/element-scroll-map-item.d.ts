import { ScrollMapItem, ScrollPosition, ViewportSize } from './scroll-map-item';
export declare type ElementScrollMapItemOptions = {
    element: HTMLElement;
    horizontal?: boolean;
    scrollToDisappear?: boolean;
};
export declare class ElementScrollMapItem implements ScrollMapItem {
    element: HTMLElement;
    horizontal: boolean;
    scrollToDisappear: boolean;
    cachedDistance: number;
    constructor(options: ElementScrollMapItemOptions);
    outerWidth(element: HTMLElement): number;
    outerHeight(element: HTMLElement): number;
    getDistance(viewportSize: ViewportSize): number;
    getPosition(viewportSize: ViewportSize, progress: number): ScrollPosition;
    getElementScrollPosition(element: HTMLElement): number;
    getDirection(): number;
    private getElementOffset(element, relativeTo?);
    onLayoutUpdated(): void;
}
