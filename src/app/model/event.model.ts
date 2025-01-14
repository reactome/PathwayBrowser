export interface DatabaseObject {
  dbId: number
}

export interface Event extends DatabaseObject {
  dbId: number;
  stId: string;
  displayName: string;
  schemaClass: string
  hasEvent?: Event[];
  hasDiagram: boolean;
  hasEHLD?:boolean;
  isSelected?: boolean;
  isHovered?: boolean;
  isInferred?: boolean;
  releaseStatus: string;
  isInDisease: boolean;
  ancestors: Event[];
  parent: Event;
  created: InstanceEdit;
  summation:Summation[]
  subpathwayColor?: string;
  hitReactionsCount?: string;
  hit?: boolean;
}


export interface InstanceEdit {
  displayName: string;
  dateTime: string;
}

export interface Summation{
  displayName: string;
  text: string
}
