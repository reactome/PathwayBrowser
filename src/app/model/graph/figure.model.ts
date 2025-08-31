import {DatabaseObject} from "./database-object.model";

export interface Figure extends DatabaseObject {
  url: string;
  schemaClass: "Figure"
}
