import { NgZone } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { ScrollHandler } from '../models/handlers/scroll-handler';
export declare type DocumentScrollHandler = {
    owner: any;
    handler: ScrollHandler;
};
export declare class ScrollService {
    private zone;
    handlers: DocumentScrollHandler[];
    constructor(zone: NgZone);
    addScrollHandler(owner: any, handler: ScrollHandler): ScrollHandler;
    removeScrollHandler(owner: any): void;
    handleAllowed(handler: ScrollHandler): boolean;
    scrollTo(position: any, duration: any, ease?: any, cancellable?: boolean): Observable<{}>;
    readonly position: any;
}
