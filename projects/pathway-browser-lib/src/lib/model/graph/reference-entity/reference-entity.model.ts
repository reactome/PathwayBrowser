import {DatabaseObject} from "../database-object.model";
import {DatabaseIdentifier} from "../database-identifier.model";
import {PhysicalEntity} from "../physical-entity/physical-entity.model";
import {ReferenceDatabase} from "../reference-database.model";


export interface ReferenceEntity extends DatabaseObject {
  identifier: string;
  url: string;
  crossReference: DatabaseIdentifier[];
  databaseName: string;
  moleculeType: string;
  name: string[];
  otherIdentifier: string[];
  physicalEntity: PhysicalEntity[];
  referenceDatabase: ReferenceDatabase;
}
