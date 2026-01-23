import {GeneticallyModifiedResidue} from "./genetically-modified-residue.model";

export interface FragmentModification extends GeneticallyModifiedResidue {
  endPositionInReferenceSequence: number;
  startPositionInReferenceSequence: number
}
