import {DatabaseObject} from "./database-object.model";

export interface Affiliation extends DatabaseObject {
  address: string;
  name: string;
}
