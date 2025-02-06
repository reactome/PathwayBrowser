import {DatabaseObject} from "../database-object.model";
import {DatabaseIdentifier} from "../database-identifier.model";


export interface ReferenceEntity extends DatabaseObject {
  identifier: string;
  url: string;
  crossReference: DatabaseIdentifier[];

}
