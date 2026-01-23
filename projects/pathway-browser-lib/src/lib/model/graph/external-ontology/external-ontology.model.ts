import {DatabaseObject} from "../database-object.model";
import {ReferenceDatabase} from "../reference-database.model";

export interface ExternalOntology extends DatabaseObject {
  databaseName: string;
  definition: string;
  identifier: string;
  instanceOf: ExternalOntology[];
  name: string;
  referenceDatabase: ReferenceDatabase;
  synonym: string[];
  url: string;
}
