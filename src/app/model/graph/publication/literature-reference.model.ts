import {Publication} from "./publication.model";
import {Person} from "../person.model";

export interface LiteratureReference extends Publication {
  journal: string;
  pages: string;
  pubMedIdentifier: number;
  url: string;
  volume: number;
  year: number;
}
