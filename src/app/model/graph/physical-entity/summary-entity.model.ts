import {PhysicalEntity} from "./physical-entity.model";
import {ReferenceEntity} from "../reference-entity/reference-entity.model";
import {Taxon} from "../taxon.model";
import {Relationship} from "../relationship.model";
import HasModifiedResidue = Relationship.HasModifiedResidue;
import {ReferenceDatabase} from "../reference-database.model";
import {DatabaseIdentifier} from "../database-identifier.model";

export interface SummaryEntity extends PhysicalEntity {
  summarisedEntities: PhysicalEntity[]

  moleculeType: string;
  databaseName: string;
  identifier: string;
  name: string[];
  otherIdentifier: string[];
  url: string;
  referenceDatabase: ReferenceDatabase;
  crossReference: DatabaseIdentifier[];

  // Summarised properties
  referenceType: string
  referenceEntity: ReferenceEntity
  species: Taxon

  // EWAS specific
  endCoordinate: number;
  startCoordinate: number;
  hasModifiedResidue: HasModifiedResidue[];
}
