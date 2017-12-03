import { Observable } from 'rxjs/Observable';
import { ScrollHandler, ScrollHandlerOptions } from './scroll-handler';
export declare class ItemsScrollHandler extends ScrollHandler {
    itemSize: number;
    itemsCount: number;
    handleScrollProcessing: boolean;
    constructor(itemSize: number, itemsCount: number, options: ScrollHandlerOptions);
    getInstantPosition(): number;
    handleScrollEvent(deltaX: any, deltaY: any, duration: any, ease?: any): void;
    scrollTo(position: any, duration: any, ease?: any, cancellable?: boolean): Observable<{}>;
}
