import {FragmentModification} from "./fragment-modification.model";

export interface FragmentInsertionModification extends FragmentModification{
  coordinate: number;
}
