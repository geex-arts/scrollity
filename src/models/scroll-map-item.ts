
export type ScrollPosition = {
  x: number
  y: number
};

export type ViewportSize = {
  width: number
  height: number
};

export interface ScrollMapItem {

  getDistance(viewportSize: ViewportSize): number;
  getPosition(viewportSize: ViewportSize, progress: number): ScrollPosition;
  getElementScrollPosition(element: HTMLElement): number;
  getDirection(): number;
  onLayoutUpdated(): void;
}
