import { Injectable, NgZone } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import * as _ from 'lodash';

import { ScrollHandler } from '../models/scroll-handler';

export type DocumentScrollHandler = {
  owner: any,
  handler: ScrollHandler
};

@Injectable()
export class ScrollService {

  handlers: DocumentScrollHandler[] = [];

  constructor(private zone: NgZone) { }

  addScrollHandler(owner, handler: ScrollHandler): ScrollHandler {
    handler.service = this;
    handler.zone = this.zone;
    handler.onInit();

    this.handlers.push({ owner: owner, handler: handler });

    handler.bind();

    return handler;
  }

  removeScrollHandler(owner) {
    let documentScrollHandler = _.last(this.handlers.filter(item => item.owner === owner));

    if (documentScrollHandler) {
      documentScrollHandler.handler.unbind();
    }

    this.handlers = this.handlers.filter(item => item !== documentScrollHandler);
  }

  handleAllowed(handler: ScrollHandler) {
    let last = _.last(this.handlers);
    return last && last.handler === handler;
  }

  scrollTo(position, duration, ease = undefined): Observable<{}> {
    let last = _.last(this.handlers);

    if (!last) {
      return;
    }

    return last.handler.scrollTo(position, duration, ease);
  }

  scrollPosition() {
    let last = _.last(this.handlers);

    if (!last) {
      return;
    }

    return last.handler.scrollPosition();
  }
}
