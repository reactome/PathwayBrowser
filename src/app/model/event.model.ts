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
  referenceEntity:ReferenceEntity;
  referenceType?: string,
  hasIcon?:boolean
  input: Event[];
  output: Event[];
  [key: string]: any;
  literatureReference?: LiteratureReference[];
  authored: InstanceEdit[];
  reviewed: InstanceEdit[];
  diseasePathways?: Event[]
  normalPathway?: Event
  orthologousEvent?: Event[]
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

export interface ReferenceEntity{
  identifier: string;
}

export interface InstanceEdit {
  displayName: string;
  dateTime: string;
}

export interface Summation{
  displayName: string;
  text: string
  literatureReference: LiteratureReference[];
}


export interface LiteratureReference {
  author: Person[];
  displayName?: string;
  title?: string;
  journal?: string;
  year?: number;
  url?: string;


}

export interface Person{
  displayName: string;
  orcidId: string;
  dbId: number;
  surname: string;
  initial:string
}
