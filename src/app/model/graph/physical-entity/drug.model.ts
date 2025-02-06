import {PhysicalEntity} from "./physical-entity.model";
import {ReferenceTherapeutic} from "../reference-entity/reference-therapeutic.model";

export interface Drug extends PhysicalEntity {
  referenceEntity: ReferenceTherapeutic
}
