import {DatabaseObject} from "./database-object.model";

export interface Taxon extends DatabaseObject {
  taxId: string;
}
