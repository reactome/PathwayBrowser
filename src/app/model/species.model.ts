import {Event} from "./graph/event.model";

export interface Species {
  dbId: number;
  displayName: string;
  shortName: string;
  taxId: string;
  name?: string[];
  schemaClass?: string;
  abbreviation: string
  className?: string;
}

export interface OrthologousMap {
  [identifier: string]: Event;
}
