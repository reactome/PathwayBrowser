export namespace Graph {
  export interface Data {
    dbId: number;
    stId: string;
    speciesName: string;
    edges: Edge[];
    nodes: Node[];
    subpathways: SubPathway[];
  }

  export type Entity = {
    dbId: number;
    stId: string
    displayName: string;
  }

  export interface Edge extends Entity {
    schemaClass: string;
  }

  export interface Node extends Entity {
    diagramIds?: number[];
    identifier: string
    parents: number[];
    children: number[];
    schemaClass: string;
    referenceType: string;
    leaves?: Node[];
    standardIdentifier?: string;
    chebiIdentifier?: string;
  }

  export interface SubPathway extends Entity {
    events: number[]
  }

}

