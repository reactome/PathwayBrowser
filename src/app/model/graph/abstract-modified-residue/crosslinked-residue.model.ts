import {TranslationalModification} from "./translational-modification.model";
import {EntitySet} from "../physical-entity/entity-set.model";
import {Polymer} from "../physical-entity/polymer.model";
import {ReferenceGroup} from "../reference-entity/reference-group.model";

export interface CrosslinkedResidue extends TranslationalModification {
  modification: EntitySet | Polymer | ReferenceGroup;
  secondCoordinate: number;
}
