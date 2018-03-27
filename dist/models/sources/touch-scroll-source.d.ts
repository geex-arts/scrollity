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
    dragging: boolean;
    constructor(scrollHandler: ScrollHandler, zone: NgZone);
    bind(): void;
    unbind(): void;
    handleTouchStartEvent(e: any): boolean;
    handleTouchMoveEvent(e: any): boolean;
    handleTouchEndEvent(e: any): boolean;
    handleTouchEndInertia(e: any, touches: any): void;
    onStickTo(position: number): void;
}
