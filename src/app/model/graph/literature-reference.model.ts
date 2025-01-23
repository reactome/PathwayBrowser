import {Publication} from "./publication.model";
import {Person} from "./person.model";

export interface LiteratureReference extends Publication {
  author: Person[];
  title: string;
  journal: string;
  year: number;
  url: string;

}
