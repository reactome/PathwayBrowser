import {DatabaseObject} from "./database-object.model";
import {ReferenceDatabase} from "./reference-database.model";


export interface DatabaseIdentifier extends DatabaseObject{
   databaseName: string;
   url: string;
   identifier: string;
   crossReference: DatabaseIdentifier[];
   referenceDatabase: ReferenceDatabase;

}
