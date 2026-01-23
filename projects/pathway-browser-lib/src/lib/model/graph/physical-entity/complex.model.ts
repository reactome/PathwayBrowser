import {PhysicalEntity} from "./physical-entity.model";

export interface Complex extends PhysicalEntity {
  hasComponent: PhysicalEntity[];

}
