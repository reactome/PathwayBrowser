import {DatabaseObject} from "../database-object.model";
import {Publication} from "../publication/publication.model";

export interface ControlReference extends DatabaseObject {
  literatureReference: Publication[];
}
