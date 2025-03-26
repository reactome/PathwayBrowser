import {DatabaseObject} from "./database-object.model";
import {GO_MolecularFunction} from "./go-term/go-molecular-function.model";
import {PhysicalEntity} from "./physical-entity/physical-entity.model";
import {PsiMod} from "./external-ontology/psi-mod.model";
import {EntitySet} from "./physical-entity/entity-set.model";
import {Polymer} from "./physical-entity/polymer.model";
import {ReferenceGroup} from "./reference-entity/reference-group.model";
import {CatalystActivityReference} from "./control-reference/catalyst-activity-reference.model";
import {RegulationReference} from "./control-reference/regulation-reference.model";
import {ReferenceMolecule} from "./reference-entity/reference-molecule.model";

/**
 * This Generic type is for rendering data in Molecular Process component and used by catalystActivity, Regulation and ModifiedResidue
 */
export interface MolecularProcess extends DatabaseObject {
  // CatalystActivity
  type: string;
  activity?: GO_MolecularFunction;
  ecNumber?: number;
  activeUnit?: PhysicalEntity[];
  catalyst?: PhysicalEntity;
  catalystActivityReference?: CatalystActivityReference;
  isCatalystActivity?: boolean;
  // Regulation
  regulator?: PhysicalEntity;
  regulationReference?: RegulationReference[];
  go_BiologicalProcess?: GO_MolecularFunction;
  isRegulation?: boolean;
  // Modifications
  name?: string;
  psiMod?: PsiMod[]; // ReplacedResidue has multiple PsiMod
  coordinate?: number;
  modification?: EntitySet | Polymer | ReferenceGroup | ReferenceMolecule;
  isModification?: boolean;
}
