import {DatabaseObject} from "./database-object.model";

export interface Person extends DatabaseObject {
  orcidId: string;
  dbId: number;
  surname: string;
  initial: string
}
