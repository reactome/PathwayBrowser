/// <reference path="../../../node_modules/@types/cytoscape/index.d.ts"/>
declare module "cytoscape-svg" {
  const svg: cytoscape.Ext;
  export = svg;
}

declare namespace cytoscape {
  interface Core {
    svg(options?: Partial<{ full: boolean; scale: number; bg: string }>): string;
  }
}
