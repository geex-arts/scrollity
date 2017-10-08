import { ScrollMapItem, ScrollPosition, ViewportSize } from './scroll-map-item';

export type LineScrollMapItemOptions = {
  x?: number,
  y?: number,
  xScreen?: number,
  yScreen?: number
};

export class LineScrollMapItem implements ScrollMapItem {

  x: number;
  y: number;
  xScreen: number;
  yScreen: number;

  constructor(options: LineScrollMapItemOptions) {
    this.x = options.x || 0;
    this.y = options.y || 0;
    this.xScreen = options.xScreen || 0;
    this.yScreen = options.yScreen || 0;
  }

  getDistance(viewportSize: ViewportSize): number {
    return Math.abs(this.x)
      + Math.abs(this.y)
      + Math.abs(this.xScreen) * viewportSize.width
      + Math.abs(this.yScreen) * viewportSize.height;
  }

  getPosition(viewportSize: ViewportSize, progress: number): ScrollPosition {
    if (progress > 1) {
      progress = 1;
    } else if (progress < 0) {
      progress = 0;
    }

    return {
      x: (this.x + this.xScreen * viewportSize.width) * progress,
      y: (this.y + this.yScreen * viewportSize.height) * progress
    };
  }

  getElementScrollPosition(_: HTMLElement): number {
    return undefined;
  }

  getDirection(): number {
    return this.y > 0 || this.yScreen > 0 ? 90 : 180;
  }

  onLayoutUpdated(): void {

  }
}
