import {PhysicalEntity} from "./physical-entity.model";
import {Species} from "../species.model";

export interface Polymer extends PhysicalEntity {
  repeatedUnit: PhysicalEntity[]
  species?: Species[]
  minUnitCount?: number
  maxUnitCount?: number
}
