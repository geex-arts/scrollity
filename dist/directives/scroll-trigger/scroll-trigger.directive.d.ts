import { ElementRef, EventEmitter, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { ScrollHandler } from '../../models/scroll-handler';
import { DocumentService } from '../../services/document.service';
import { ScrollMapItem } from '../../models/scroll-map-item';
export declare type ScrollTriggerOptions = {
    handler: ScrollHandler;
    elementTrigger?: number;
    screenTrigger?: number;
    offset?: number;
    scrollMapItem?: ScrollMapItem;
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
    handler: ScrollHandler;
    elementTrigger: number;
    screenTrigger: number;
    offset: number;
    scrollMapItem: ScrollMapItem;
    private _position;
    constructor(el: ElementRef, documentService: DocumentService);
    ngOnChanges(changes: SimpleChanges): void;
    ngOnDestroy(): void;
    updatePosition(): boolean;
    readonly position: number;
    readonly element: any;
    onActivated(event: ScrollTriggerEvent): void;
    onDeactivated(event: ScrollTriggerEvent): void;
}
