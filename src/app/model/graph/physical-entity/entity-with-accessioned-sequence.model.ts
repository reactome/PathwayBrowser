import {GenomeEncodedEntity} from "./genome-encoded-entity.model";

export interface EntityWithAccessionedSequence extends GenomeEncodedEntity{

  className:string // not from graph model
  referenceType:string
}
