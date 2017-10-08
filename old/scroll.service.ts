import { Injectable } from '@angular/core';
import _ = require('lodash');

import { ScrollHandler, ScrollHandlerOptions } from './scroll-handler';

export type DocumentScrollHandler = {
  owner: any,
  handler: ScrollHandler
};

@Injectable()
export class ScrollService {

  handlers: DocumentScrollHandler[] = [];

  addScrollHandler(owner, element, options: ScrollHandlerOptions = {}): ScrollHandler {
    let handler = new ScrollHandler(this, element, options);

    this.handlers.push({ owner: owner, handler: handler });

    handler.bind();

    return handler;
  }

  removeScrollHandler(owner) {
    let documentScrollHandler = _.last(this.handlers.filter(item => item.owner === owner));

    documentScrollHandler.handler.unbind();

    this.handlers = this.handlers.filter(item => item !== documentScrollHandler);
  }

  handleAllowed(handler: ScrollHandler) {
    let last = _.last(this.handlers);
    return last && last.handler === handler;
  }
}
