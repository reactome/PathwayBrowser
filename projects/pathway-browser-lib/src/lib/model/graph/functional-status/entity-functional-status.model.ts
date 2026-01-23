import {FunctionalStatus} from "./functional-status.model";
import {DatabaseObject} from "../database-object.model";
import {PhysicalEntity} from "../physical-entity/physical-entity.model";

export interface EntityFunctionalStatus extends DatabaseObject {
  diseaseEntity: PhysicalEntity
  normalEntity: PhysicalEntity
  functionalStatus: FunctionalStatus;
  schemaClass: "EntityFunctionalStatus";
}
