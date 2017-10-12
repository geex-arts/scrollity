
export interface ScrollSource {

  bind();
  unbind();
  onStickTo(position: number);
}
