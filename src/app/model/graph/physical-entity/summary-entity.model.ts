import {PhysicalEntity} from "./physical-entity.model";
import {ReferenceEntity} from "../reference-entity/reference-entity.model";
import {Taxon} from "../taxon.model";
import {Relationship} from "../relationship.model";
import HasModifiedResidue = Relationship.HasModifiedResidue;

export interface SummaryEntity extends PhysicalEntity {
  summarisedEntities: PhysicalEntity[]

  // Summarised properties
  referenceType: string
  referenceEntity: ReferenceEntity
  species: Taxon

  // EWAS specific
  endCoordinate: number;
  startCoordinate: number;
  hasModifiedResidue: HasModifiedResidue[];
}
