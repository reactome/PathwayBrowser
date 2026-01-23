import {DatabaseObject} from "../database-object.model";


export interface FunctionalStatusType extends DatabaseObject {
  definition: string
  name: string
  schemaClass: "FunctionalStatusType"
}
