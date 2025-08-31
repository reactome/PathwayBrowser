import {PhysicalEntity} from "./physical-entity.model";
import {ReferenceEntity} from "../reference-entity/reference-entity.model";
import {Taxon} from "../taxon.model";
import {Relationship} from "../relationship.model";
import HasModifiedResidue = Relationship.HasModifiedResidue;
import {ReferenceDatabase} from "../reference-database.model";
import {DatabaseIdentifier} from "../database-identifier.model";
import {ReferenceGeneProduct} from "../reference-entity/reference-gene-product.model";
import {ReferenceRNASequence} from "../reference-entity/reference-rna-sequence.model";
import {ReferenceDNASequence} from "../reference-entity/reference-dna-sequence.model";

export interface SummaryEntity extends PhysicalEntity {
  summarisedEntities: PhysicalEntity[]

  moleculeType: string;
  databaseName: string;
  identifier: string;
  name: string[];
  otherIdentifier?: string[];
  url: string;
  referenceDatabase: ReferenceDatabase;
  crossReference?: DatabaseIdentifier[];

  // Sequence specific
  checksum?: string;
  comment?: string[];
  description?: string[];
  geneName?: string[];
  isSequenceChanged?: boolean;
  keyword?: string[];
  secondaryIdentifier?: string[];
  sequenceLength?: number;
  species?: Taxon;

  // GeneProduct specific
  chain?: string[];
  referenceGene?: ReferenceDNASequence;
  referenceTranscript?: ReferenceRNASequence;

  // Isoform specific
  variantIdentifier?: string;
  isoformParent?: ReferenceGeneProduct[];

  // Summarised properties
  referenceType: string
  referenceEntity: ReferenceEntity

  // EWAS specific
  endCoordinate?: number;
  startCoordinate?: number;
  hasModifiedResidue?: HasModifiedResidue[];

  schemaClass: "SummaryEntity"
}
