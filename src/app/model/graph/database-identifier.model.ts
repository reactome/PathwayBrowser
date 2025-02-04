import {DatabaseObject} from "./database-object.model";

export interface DatabaseIdentifier extends DatabaseObject{
   databaseName: string;
   url: string;
}
