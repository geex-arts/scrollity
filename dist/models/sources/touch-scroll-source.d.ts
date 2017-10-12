import { NgZone } from '@angular/core';
import { ScrollHandler } from '../handlers/scroll-handler';
import { ScrollSource } from './scroll-source.interface';
export declare class TouchScrollSource implements ScrollSource {
    private scrollHandler;
    private zone;
    touchStartListener: any;
    touchMoveListener: any;
    touchEndListener: any;
    lastTouch: any;
    touchMoves: any[];
    constructor(scrollHandler: ScrollHandler, zone: NgZone);
    bind(): void;
    unbind(): void;
    handleTouchStartEvent(e: any): boolean;
    handleTouchMoveEvent(e: any): boolean;
    handleTouchEndEvent(): boolean;
    handleTouchEndInertia(touches: any): void;
    onStickTo(position: number): void;
}
