
export interface BaseScrollHandler {

  bind();
  unbind();
  onStickTo(position: number);
}
