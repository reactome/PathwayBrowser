import {Event} from "./event.model";

export interface Pathway extends Event {
  hasEvent: Event[];
  hasDiagram: boolean;
  hasEHLD: boolean;
  normalPathway?: Pathway;
  diseasePathways? : Pathway[];
  orthologousEvent?: Event[]

  //not from API endpoint but are needed in the tree view
  subpathwayColor?: string;
  hitReactionsCount?: string;
  hit?: boolean;
}

