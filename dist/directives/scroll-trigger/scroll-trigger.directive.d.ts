import { ElementRef, EventEmitter, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { ScrollHandler } from '../../models/handlers/scroll-handler';
import { DocumentService } from '../../services/document.service';
import { ScrollMapItem } from '../../models/handlers/map-scroll-handler/scroll-map-item';
export declare type ScrollTriggerStickOptions = {
    distance?: number;
    duration?: number;
    ease?: any;
    threshold?: number;
    direction?: number;
};
export declare type ScrollTriggerOptions = {
    handler: ScrollHandler;
    elementTrigger?: number;
    screenTrigger?: number;
    offset?: number;
    scrollMapItem?: ScrollMapItem;
    stick?: ScrollTriggerStickOptions;
};
export declare type ScrollTriggerEvent = {
    triggerPosition: number;
    previousScrollPosition: number;
    scrollPosition: number;
};
export declare class ScrollTriggerDirective implements OnChanges, OnDestroy {
    private el;
    private documentService;
    options: ScrollTriggerOptions;
    triggerActivated: EventEmitter<ScrollTriggerEvent>;
    triggerDeactivated: EventEmitter<ScrollTriggerEvent>;
    triggerPassed: EventEmitter<ScrollTriggerEvent>;
    triggerSticked: EventEmitter<{}>;
    handler: ScrollHandler;
    elementTrigger: number;
    screenTrigger: number;
    offset: number;
    scrollMapItem: ScrollMapItem;
    stick: ScrollTriggerStickOptions;
    private _position;
    constructor(el: ElementRef, documentService: DocumentService);
    ngOnChanges(changes: SimpleChanges): void;
    ngOnDestroy(): void;
    updatePosition(): boolean;
    readonly position: number;
    readonly element: any;
    onActivated(event: ScrollTriggerEvent): void;
    onDeactivated(event: ScrollTriggerEvent): void;
    onSticked(): void;
}
