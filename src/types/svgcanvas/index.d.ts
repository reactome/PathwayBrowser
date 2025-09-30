declare module 'svgcanvas'{
  export interface Options {
    /**
     * falsy values get converted to 500
     */
    width?: number;
    /**
     * falsy values get converted to 500
     */
    height?: number;
    /**
     * existing Context2D to wrap around
     */
    ctx: CanvasRenderingContext2D;
    /**
     * whether canvas mirroring (get image data) is enabled (defaults to false)
     */
    enableMirroring?: boolean;
    /**
     * overrides default document object
     */
    document?: Document;
  }

  export class Context extends CanvasRenderingContext2D {
    constructor(width: number, height: number);
    constructor(options: Options);
    getSerializedSvg: () => string;
    getSvg: () => SVGSVGElement;
  }
  export interface Element extends HTMLCanvasElement {
    ctx : Context;
    wrapper: HTMLDivElement;
    svg: SVGSVGElement;
  }
}
