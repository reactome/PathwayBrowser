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

  //Obj
  category?:string
  className:string;
  speciesName?: string;
  name?: string[];
  compartment?: Compartment[];
  tissue?: Tissue;
  reviewStatus?: ReviewStatus;
  referenceEntity:referenceEntity;
  referenceType?: string
}

export interface Compartment{
   displayName: string;
   url:string;
}

export interface Tissue{
  displayName: string;
  url:string;
}

export interface ReviewStatus {
  displayName: string;
}

export interface referenceEntity{
  identifier: string;
}

export interface InstanceEdit {
  displayName: string;
  dateTime: string;
}

export interface Summation{
  displayName: string;
  text: string
}
