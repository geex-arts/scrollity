import { Observable } from 'rxjs/Observable';
import { ScrollHandler } from './scroll-handler';
export declare class DefaultScrollHandler extends ScrollHandler {
    getInstantPosition(): number;
    handleScrollEvent(deltaX: any, deltaY: any, duration: any): void;
    scrollTo(position: any, duration: any, ease?: any, cancellable?: boolean): Observable<{}>;
}
