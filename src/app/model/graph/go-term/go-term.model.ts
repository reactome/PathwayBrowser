import {DatabaseObject} from "../database-object.model";
import {ReferenceDatabase} from "../reference-database.model";

export interface Go_Term extends DatabaseObject {
  url: string;
  definition: string;
  databaseName: string;
  name: String;
  referenceDatabase: ReferenceDatabase;
  accession: string;
}
