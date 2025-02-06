import {ReferenceSequence} from "./reference-sequence.model";
import {ReferenceDNASequence} from "./reference-dna-sequence.model";

export interface ReferenceRNASequence extends ReferenceSequence {
  referenceGene: ReferenceDNASequence[]
}
