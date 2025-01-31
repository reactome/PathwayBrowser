import {DatabaseObject} from "./database-object.model";
import {Person} from "./person.model";

export interface InstanceEdit extends DatabaseObject {
  dateTime: string;
  author: Person[];
}
