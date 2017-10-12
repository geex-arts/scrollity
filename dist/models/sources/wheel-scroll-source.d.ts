import { NgZone } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { Subject } from 'rxjs/Subject';
import { ScrollHandler } from '../handlers/scroll-handler';
import { ScrollSource } from './scroll-source.interface';
export declare class WheelScrollSource implements ScrollSource {
    private scrollHandler;
    private zone;
    mouseWheelListener: any;
    subscriptions: Subscription[];
    wheelEventReleased: Subject<any>;
    wheelEventCaptured: boolean;
    constructor(scrollHandler: ScrollHandler, zone: NgZone);
    bind(): void;
    unbind(): void;
    handleWheelEvent(e: any): boolean;
    handleWheelReleaseEvent(): void;
    onStickTo(position: number): void;
}
