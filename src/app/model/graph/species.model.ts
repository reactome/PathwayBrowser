import {Event} from "./event/event.model";
import {Taxon} from "./taxon.model";

export interface Species extends Taxon {
  shortName: string;
  abbreviation: string;
}

export interface OrthologousMap {
  [identifier: string]: Event;
}
