import { NgZone } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { ScrollHandler } from '../handlers/scroll-handler';
import { ScrollSource } from './scroll-source.interface';
export declare class KeyboardScrollSource implements ScrollSource {
    private scrollHandler;
    private zone;
    subscriptions: Subscription[];
    constructor(scrollHandler: ScrollHandler, zone: NgZone);
    bind(): void;
    unbind(): void;
    handleKeyboardEvent(e: KeyboardEvent): boolean;
    onStickTo(position: number): void;
}
