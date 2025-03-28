import {DatabaseObject} from "./database-object.model";
import {DatabaseIdentifier} from "./database-identifier.model";

export interface Taxon extends DatabaseObject {
  taxId: string;
}
