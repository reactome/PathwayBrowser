import {DatabaseObject} from "./database-object.model";
import {Publication} from "./publication/publication.model";

export interface Summation extends DatabaseObject{
  text: string;
  literatureReference: Publication[];
}
