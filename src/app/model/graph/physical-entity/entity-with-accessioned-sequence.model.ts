import {GenomeEncodedEntity} from "./genome-encoded-entity.model";
import {ReferenceSequence} from "../reference-entity/reference-sequence.model";

export interface EntityWithAccessionedSequence extends GenomeEncodedEntity {

  referenceEntity: ReferenceSequence
  referenceType: string
}
