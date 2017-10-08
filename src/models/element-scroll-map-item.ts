import { ScrollMapItem, ScrollPosition, ViewportSize } from './scroll-map-item';

export type ElementScrollMapItemOptions = {
  element: HTMLElement;
  horizontal?: boolean;
  scrollToDisappear?: boolean;
};

export class ElementScrollMapItem implements ScrollMapItem {

  element: HTMLElement;
  horizontal: boolean;
  scrollToDisappear: boolean;
  cachedDistance: number;

  constructor(options: ElementScrollMapItemOptions) {
    this.element = options.element;
    this.horizontal = options.horizontal || false;
    this.scrollToDisappear = options.scrollToDisappear || false;
  }

  outerWidth(element: HTMLElement) {
    let result = this.element.offsetWidth;

    result += parseInt(window.getComputedStyle(element).getPropertyValue('margin-left'), 10);
    result += parseInt(window.getComputedStyle(element).getPropertyValue('margin-right'), 10);

    return result;
  }

  outerHeight(element: HTMLElement) {
    let result = this.element.offsetHeight;

    result += parseInt(window.getComputedStyle(element).getPropertyValue('margin-top'), 10);
    result += parseInt(window.getComputedStyle(element).getPropertyValue('margin-bottom'), 10);

    return result;
  }

  getDistance(viewportSize: ViewportSize): number {
    if (this.cachedDistance !== undefined) {
      return this.cachedDistance;
    }

    let value;

    if (this.scrollToDisappear) {
      value = this.horizontal
        ? this.outerWidth(this.element)
        : this.outerHeight(this.element);
    } else {
      value = this.horizontal
        ? this.outerWidth(this.element) - viewportSize.width
        : this.outerHeight(this.element) - viewportSize.height;
    }

    this.cachedDistance = value;

    return value;
  }

  getPosition(viewportSize: ViewportSize, progress: number): ScrollPosition {
    if (progress > 1) {
      progress = 1;
    } else if (progress < 0) {
      progress = 0;
    }

    return this.horizontal ? {
      x: this.getDistance(viewportSize) * progress,
      y: 0
    } : {
      x: 0,
      y: this.getDistance(viewportSize) * progress
    };
  }

  getElementScrollPosition(element: HTMLElement): number {
    return this.horizontal
      ? this.getElementOffset(element).left - this.getElementOffset(this.element).left
      : this.getElementOffset(element).top - this.getElementOffset(this.element).top;
  }

  getDirection(): number {
    return this.horizontal ? 90 : 180;
  }

  private getElementOffset(element, relativeTo = undefined) {
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

  onLayoutUpdated(): void {
    this.cachedDistance = undefined;
  }
}
