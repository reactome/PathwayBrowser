import {DatabaseObject} from "../database-object.model";
import {SequenceOntology} from "../external-ontology/sequence-ontology.model";
import {FunctionalStatusType} from "./functional-status-type.model";

export interface FunctionalStatus extends DatabaseObject {
  functionalStatusType: FunctionalStatusType
  structuralVariant: SequenceOntology
  schemaClass: "FunctionalStatus"
}
