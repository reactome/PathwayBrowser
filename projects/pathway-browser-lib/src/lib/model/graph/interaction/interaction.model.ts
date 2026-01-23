import {DatabaseObject} from "../database-object.model";
import {ReferenceDatabase} from "../reference-database.model";

export interface Interaction extends DatabaseObject {
  accession: string
  databaseName: string
  pubmed: string[]
  referenceDatabase: ReferenceDatabase
  score: number
  url: string
}
