import {CrosslinkedResidue} from "./crosslinked-residue.model";
import {ReferenceSequence} from "../reference-entity/reference-sequence.model";

export interface InterChainCrosslinkedResidue extends CrosslinkedResidue {
  equivalentTo: InterChainCrosslinkedResidue[];
  secondReferenceSequence: ReferenceSequence[];
}
