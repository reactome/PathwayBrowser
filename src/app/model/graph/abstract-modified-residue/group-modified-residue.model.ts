import {TranslationalModification} from "./translational-modification.model";
import {ReferenceGroup} from "../reference-entity/reference-group.model";
import {Polymer} from "../physical-entity/polymer.model";
import {EntitySet} from "../physical-entity/entity-set.model";

export interface GroupModifiedResidue extends TranslationalModification {
  modification: EntitySet | Polymer | ReferenceGroup;
}
