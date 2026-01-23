import {DatabaseObject} from "../database-object.model";
import {ReferenceSequence} from "../reference-entity/reference-sequence.model";

export interface AbstractModifiedResidue extends DatabaseObject {
  referenceSequence: ReferenceSequence;
}
