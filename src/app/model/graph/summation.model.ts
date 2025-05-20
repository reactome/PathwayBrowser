import {DatabaseObject} from "./database-object.model";
import {LiteratureReference} from "./publication/literature-reference.model";

export interface Summation extends DatabaseObject {
  text: string
  literatureReference: LiteratureReference[];
}
