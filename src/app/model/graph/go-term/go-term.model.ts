import {DatabaseObject} from "../database-object.model";
import {ReferenceDatabase} from "../reference-database.model";

export interface GoTerm extends DatabaseObject {
  url: string;
  definition: string;
  databaseName: string;
  name: String;
  referenceDatabase: ReferenceDatabase;
}
