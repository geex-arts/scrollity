import { NgZone } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { ScrollService } from '../services/scroll.service';
import { ScrollTriggerDirective } from '../directives/scroll-trigger/scroll-trigger.directive';
import { ScrollMapItem } from './scroll-map-item';
export declare type ScrollHandlerOptions = {
    horizontal?: boolean;
    slides?: boolean;
    translate?: boolean;
    initialPosition?: number;
    viewport?: any;
    overrideScroll?: boolean;
    scrollMap?: ScrollMapItem[];
};
export declare class ScrollHandler {
    private service;
    element: HTMLElement;
    private zone;
    enabled: boolean;
    horizontal: boolean;
    slides: boolean;
    _slidesObservable: Subject<{
        forwardDirection: boolean;
    }>;
    translate: boolean;
    initialPosition: number;
    viewport: any;
    overrideScroll: boolean;
    _scrollMap: ScrollMapItem[];
    lastSlideDate: Date;
    lastSlideScrollDate: Date;
    timeline: any;
    scrollListener: any;
    mouseWheelListener: any;
    touchStartListener: any;
    touchMoveListener: any;
    touchEndListener: any;
    resizeListener: any;
    animatingScroll: boolean;
    _position: BehaviorSubject<number>;
    _scrollMapPosition: BehaviorSubject<{
        x: number;
        y: number;
    }>;
    _viewportSize: any;
    _contentSize: any;
    lastTouch: any;
    triggers: {
        trigger: ScrollTriggerDirective;
        activated: boolean;
    }[];
    previousScrollPosition: number;
    constructor(service: ScrollService, element: HTMLElement, zone: NgZone, options: ScrollHandlerOptions);
    scrollMap: any;
    addTrigger(trigger: any): void;
    removeTrigger(trigger: any): void;
    enable(): void;
    disable(): void;
    bind(): void;
    unbind(): void;
    handleScrollEvent(): void;
    handleWheelEvent(e: any): boolean;
    handleTouchStartEvent(e: any): boolean;
    handleTouchMoveEvent(e: any): boolean;
    handleTouchEndEvent(): void;
    handleSlideScrollEvent(deltaX: any, deltaY: any): void;
    handleScrollMapScrollEvent(deltaX: any, deltaY: any): void;
    handleDefaultScrollEvent(deltaX: any, deltaY: any): void;
    handleResizeEvent(): void;
    readonly slidesObservable: Observable<{
        forwardDirection: boolean;
    }>;
    scrollTo(position: any, duration: any, ease?: any): Observable<{}>;
    scrollToMapPosition(position: any, duration: any, ease?: any): void;
    scrollPosition(): number;
    readonly viewportSize: any;
    updateViewportSize(): void;
    readonly contentSize: any;
    updateContentSize(): void;
    updateTriggerPositions(): void;
    updateScrollMapItems(): void;
    readonly position: Observable<number>;
    readonly scrollMapPosition: Observable<{
        x: number;
        y: number;
    }>;
    readonly scrollMapItemPositions: {
        startPosition: number;
        endPosition: number;
        item: ScrollMapItem;
    }[];
    onScroll(position: any): void;
}
