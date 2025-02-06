import {GenomeEncodedEntity} from "./genome-encoded-entity.model";
import {ReferenceSequence} from "../reference-entity/reference-sequence.model";

export interface EntityWithAccessionedSequence extends GenomeEncodedEntity {

  className: string // not from graph model
  referenceEntity: ReferenceSequence
  referenceType: string
}
