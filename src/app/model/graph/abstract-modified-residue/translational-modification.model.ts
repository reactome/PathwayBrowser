import {AbstractModifiedResidue} from "./abstract-modified-residue.model";
import {PsiMod} from "../external-ontology/psi-mod.model";

export interface TranslationalModification extends AbstractModifiedResidue {
  coordinate: number;
  label: string;
  psiMod: PsiMod;
}
