import {DatabaseObject} from "../database-object.model";
import {Person} from "../person.model";

export interface Publication extends DatabaseObject {
  author: Person[];
  title: string
}
