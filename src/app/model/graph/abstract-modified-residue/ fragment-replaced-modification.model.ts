import {FragmentModification} from "./fragment-modification.model";

export interface FragmentReplacedModification extends FragmentModification {
  alteredAminoAcidFragment: string
}
