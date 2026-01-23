import {DatabaseObject} from "./database-object.model";

export interface ReferenceDatabase extends DatabaseObject {
  accessUrl: string;
  name: string[];
  resourceIdentifier: string;
  url: string;
}
