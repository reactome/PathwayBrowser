import {DatabaseObject} from "./database-object.model";

export interface ReferenceEntity extends DatabaseObject {
  identifier: string;
}
