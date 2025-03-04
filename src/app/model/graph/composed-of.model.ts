import {PhysicalEntity} from "./physical-entity/physical-entity.model";

export interface ComposedOf {
  type: string;
  stoichiometry: number;
  order: number;
  element: PhysicalEntity;
}
