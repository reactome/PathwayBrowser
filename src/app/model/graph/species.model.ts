import {Taxon} from "./taxon.model";

export interface Species extends Taxon {
  shortName: string;
  abbreviation: string;
}

export type OrthologousMap = Map<string, string | undefined>;
