import { NgZone } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { ScrollHandler, ScrollHandlerOptions } from '../models/scroll-handler';
export declare type DocumentScrollHandler = {
    owner: any;
    handler: ScrollHandler;
};
export declare class ScrollService {
    private zone;
    handlers: DocumentScrollHandler[];
    constructor(zone: NgZone);
    addScrollHandler(owner: any, element: any, options?: ScrollHandlerOptions): ScrollHandler;
    removeScrollHandler(owner: any): void;
    handleAllowed(handler: ScrollHandler): boolean;
    scrollTo(position: any, duration: any, ease?: any): Observable<{}>;
    scrollPosition(): any;
}
