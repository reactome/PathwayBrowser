import {DatabaseObject} from "./database-object.model";

export interface Person extends DatabaseObject {
  orcidId: string;
  dbId: number;
  initial: string
  firstname: string;
  surname: string;
}
