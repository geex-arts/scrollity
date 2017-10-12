
export interface ScrollSourceHandler {

  bind();
  unbind();
  onStickTo(position: number);
}
