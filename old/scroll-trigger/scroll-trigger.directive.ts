import {
  Directive, ElementRef, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges
} from '@angular/core';

import { ScrollHandler } from '../../models/scroll-handler';
import { DocumentService } from '../../services/document.service';

export type ScrollTriggerOptions = {
  handler: ScrollHandler,
  elementTrigger?: number,
  screenTrigger?: number,
  offset?: number
};

export type ScrollTriggerEvent = {
  triggerPosition: number,
  previousScrollPosition: number,
  scrollPosition: number
};

@Directive({ selector: '[scroll-trigger]' })
export class ScrollTriggerDirective implements OnChanges, OnDestroy {

  @Input('scroll-trigger') options: ScrollTriggerOptions;
  @Output('triggeractivated') triggerActivated = new EventEmitter<ScrollTriggerEvent>();
  @Output('triggerdeactivated') triggerDeactivated = new EventEmitter<ScrollTriggerEvent>();
  @Output('triggerpassed') triggerPassed = new EventEmitter<ScrollTriggerEvent>();

  handler: ScrollHandler;
  elementTrigger: number;
  screenTrigger: number;
  offset: number;
  private _position: number;

  constructor(private el: ElementRef, private documentService: DocumentService) { }

  ngOnChanges(changes: SimpleChanges): void {
    let options = changes['options'].currentValue;

    if (!options) {
      if (this.handler) {
        this.handler.removeTrigger(this);
        this.handler = undefined;
        this.elementTrigger = undefined;
        this.screenTrigger = undefined;
        this.offset = undefined;
      }

      return;
    }

    if (!options.handler) {
      return;
    }

    this.handler = options.handler;
    this.elementTrigger = options.elementTrigger != undefined ? options.elementTrigger : 0;
    this.screenTrigger = options.screenTrigger != undefined ? options.screenTrigger : 0.5;
    this.offset = options.offset != undefined ? options.offset : 0;

    this.updatePosition();
    this.options.handler.addTrigger(this);
  }

  ngOnDestroy(): void {
    if (this.options && this.options.handler) {
      this.options.handler.removeTrigger(this);
    }
  }

  updatePosition(): boolean {
    if (!this.handler) {
      return;
    }

    let position = this.handler.horizontal
      ? this.documentService.getOffset(this.el.nativeElement, this.handler.element).left
      : this.documentService.getOffset(this.el.nativeElement, this.handler.element).top;

    position += this.offset || 0;

    if (this.elementTrigger != 0) {
      position += this.handler.horizontal
        ? this.elementTrigger * this.el.nativeElement.offsetWidth
        : this.elementTrigger * this.el.nativeElement.offsetHeight;
    }

    if (this.screenTrigger != 0) {
      position -= this.handler.horizontal
        ? this.screenTrigger * this.handler.viewportSize.width
        : this.screenTrigger * this.handler.viewportSize.height;
    }

    if (this._position == position) {
      return false;
    }

    this._position = position;
    return true;
  }

  get position() {
    return this._position;
  }

  get element() {
    return this.el.nativeElement;
  }

  onActivated(event: ScrollTriggerEvent) {
    this.triggerActivated.emit(event);
    this.triggerPassed.emit(event);
  }

  onDeactivated(event: ScrollTriggerEvent) {
    this.triggerDeactivated.emit(event);
    this.triggerPassed.emit(event);
  }
}
