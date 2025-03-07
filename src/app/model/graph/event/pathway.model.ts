import {Event} from "./event.model";
import {Relationship} from "../relationship.model";
import HasEvent = Relationship.HasEvent;

export interface Pathway extends Event {
  events: HasEvent[];
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

