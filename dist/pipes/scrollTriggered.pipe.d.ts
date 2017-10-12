import { PipeTransform } from '@angular/core';
import { ScrollHandler } from '../models/handlers/scroll-handler';
export declare class ScrollTriggeredPipe implements PipeTransform {
    transform(scrollHandler: ScrollHandler, element: HTMLElement): boolean;
}
