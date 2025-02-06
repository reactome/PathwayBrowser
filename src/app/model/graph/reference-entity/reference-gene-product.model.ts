import {ReferenceSequence} from "./reference-sequence.model";
import {ReferenceDNASequence} from "./reference-dna-sequence.model";
import {ReferenceRNASequence} from "./reference-rna-sequence.model";

export interface ReferenceGeneProduct extends ReferenceSequence {
  chain?: string[]
  referenceGene?: ReferenceDNASequence[]
  referenceTranscript?: ReferenceRNASequence[]
}
