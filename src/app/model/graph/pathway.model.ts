import {Event} from "./event.model";

export interface Pathway extends Event {
  hasEvent: Event[];
  hasDiagram: boolean;
  hasEHLD: boolean;


  //not from API endpoint but are needed in the tree view
  subpathwayColor?: string;
  hitReactionsCount?: string;
  hit?: boolean;
}

