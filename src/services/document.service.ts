import { Injectable } from '@angular/core';

@Injectable()
export class DocumentService {

  getOffset(element, relativeTo = null) {
    let x = 0;
    let y = 0;

    while (element && !isNaN(element.offsetLeft) && !isNaN(element.offsetTop)) {
      x += element.offsetLeft - element.scrollLeft;
      y += element.offsetTop - element.scrollTop;
      element = element.offsetParent;

      if (relativeTo && element == relativeTo) {
        break;
      }
    }

    return { top: y, left: x };
  }
}
