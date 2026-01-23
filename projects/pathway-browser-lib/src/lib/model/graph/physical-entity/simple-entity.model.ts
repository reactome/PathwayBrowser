import {PhysicalEntity} from "./physical-entity.model";
import {ReferenceMolecule} from "../reference-entity/reference-molecule.model";

export interface SimpleEntity extends PhysicalEntity {
  referenceEntity: ReferenceMolecule
}
