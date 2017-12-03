import { Pipe, PipeTransform } from '@angular/core';

import { ScrollHandler } from '../models/handlers/scroll-handler';

@Pipe({
  name: 'scrollTriggered',
  pure: false
})
export class ScrollTriggeredPipe implements PipeTransform {

  transform(scrollHandler: ScrollHandler, element: HTMLElement): boolean {
    if (!scrollHandler) {
      return;
    }

    const trigger = scrollHandler.triggerStates.find(item => item.trigger.element == element);
    return trigger ? trigger.activated : false;
  }
}
