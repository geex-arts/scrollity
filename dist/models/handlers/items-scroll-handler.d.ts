import { Observable } from 'rxjs/Observable';
import { ScrollHandler, ScrollHandlerOptions } from './scroll-handler';
import { Lethargy } from '../../utils/lethargy';
export declare class ItemsScrollHandler extends ScrollHandler {
    itemSize: number;
    itemsCount: number;
    handleScrollProcessing: boolean;
    lethargy: Lethargy;
    constructor(itemSize: number, itemsCount: number, options: ScrollHandlerOptions);
    getInstantPosition(): number;
    handleScrollEvent(e: any, deltaX: any, deltaY: any, duration: any, ease?: any): void;
    scrollTo(position: any, duration: any, ease?: any, cancellable?: boolean): Observable<{}>;
}
