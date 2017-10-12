export interface ScrollSource {
    bind(): any;
    unbind(): any;
    onStickTo(position: number): any;
}
