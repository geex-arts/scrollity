import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { ScrollTriggerDirective } from '../../directives/scroll-trigger/scroll-trigger.directive';
import { ScrollMapItem } from './map-scroll-handler/scroll-map-item';
import { ScrollHandler, ScrollHandlerOptions } from './scroll-handler';
export declare class MapScrollHandler extends ScrollHandler {
    _scrollMap: ScrollMapItem[];
    _scrollMapPosition: BehaviorSubject<{
        x: number;
        y: number;
    }>;
    scrollMapItemPositions: {
        startPosition: number;
        endPosition: number;
        item: ScrollMapItem;
    }[];
    constructor(scrollMap: ScrollMapItem[], options: ScrollHandlerOptions);
    scrollMap: any;
    getInstantPosition(): number;
    handleResizeEvent(): void;
    handleScrollEvent(deltaX: any, deltaY: any, duration: any, ease?: any): void;
    scrollTo(position: any, duration: any, ease?: any, cancellable?: boolean): Observable<{}>;
    calculateScrollMapPosition(position: any): {
        x: number;
        y: number;
    };
    updateScrollMapItems(): void;
    readonly scrollMapPosition: Observable<{
        x: number;
        y: number;
    }>;
    updateScrollMapItemPositions(): void;
    getTriggerPosition(trigger: ScrollTriggerDirective): number;
}
