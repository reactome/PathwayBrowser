import {GeneticallyModifiedResidue} from "./genetically-modified-residue.model";
import {PsiMod} from "../external-ontology/psi-mod.model";

export interface ReplacedResidue extends GeneticallyModifiedResidue {
  coordinate: number;
  psiMod: PsiMod[]
}
