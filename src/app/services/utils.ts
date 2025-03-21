import {Event} from "../model/graph/event/event.model";
import {DatabaseObject} from "../model/graph/database-object.model";
import {Pathway} from "../model/graph/event/pathway.model";
import {ReactionLikeEvent} from "../model/graph/event/reaction-like-event.model";
import {PhysicalEntity} from "../model/graph/physical-entity/physical-entity.model";
import {TopLevelPathway} from "../model/graph/event/top-level-pathway.model";
import {CellLineagePath} from "../model/graph/event/cell-lineage-path.model";
import {EntityWithAccessionedSequence} from "../model/graph/physical-entity/entity-with-accessioned-sequence.model";
import {LiteratureReference} from "../model/graph/publication/literature-reference.model";
import {SchemaClasses} from "../constants/constants";
import {CatalystActivity} from "../model/graph/catalyst-activity.model";
import {Regulation} from "../model/graph/Regulation/regulation.model";
import {Relationship} from "../model/graph/relationship.model";
import {GroupModifiedResidue} from "../model/graph/abstract-modified-residue/group-modified-residue.model";
import {ReferenceGroup} from "../model/graph/reference-entity/reference-group.model";
import {CrosslinkedResidue} from "../model/graph/abstract-modified-residue/crosslinked-residue.model";
import {IntraChainCrosslinkedResidue} from "../model/graph/abstract-modified-residue/intra-chain-crosslinked-residue.model";
import {InterChainCrosslinkedResidue} from "../model/graph/abstract-modified-residue/inter-chain-crosslinked-residue.model";
import HasModifiedResidue = Relationship.HasModifiedResidue;

export function isDefined<T>(value: T | undefined | null): value is T {
  return value !== undefined && value !== null
}

export function sortByYearDescending(refs: LiteratureReference[]) {
  return refs.sort((a, b) => {
    if (a.year === undefined && b.year === undefined) return 0;
    if (a.year === undefined) return 1;
    if (b.year === undefined) return -1;
    return b.year - a.year;
  });
}

// Type guards to narrow the type
export function isEvent(obj: DatabaseObject): obj is Event {
  return isPathway(obj) || isTLP(obj) || isCellLineagePath(obj) || isRLE(obj);
}

export function isPathway(obj: DatabaseObject): obj is Pathway {
  return obj.schemaClass === SchemaClasses.PATHWAY;
}

export function isTLP(obj: DatabaseObject): obj is TopLevelPathway {
  return obj.schemaClass === SchemaClasses.TLP;
}

export function isCellLineagePath(obj: DatabaseObject): obj is CellLineagePath {
  return obj.schemaClass === SchemaClasses.CELL_LINEAGE_PATH;
}

export function isPathwayOrTLP(obj: DatabaseObject): obj is Pathway | TopLevelPathway | CellLineagePath {
  return isPathway(obj) || isTLP(obj) || isCellLineagePath(obj);
}

const physicalEntityClasses: Set<String> = new Set([SchemaClasses.PE, SchemaClasses.COMPLEX, SchemaClasses.DRUG, SchemaClasses.CHEMICAL_DRUG, SchemaClasses.PROTEIN_DRUG, SchemaClasses.RNA_DRUG, SchemaClasses.ENTITY_SET, SchemaClasses.CANDIDATE_SET, SchemaClasses.GENOME_ENCODED_ENTITY,
  SchemaClasses.EWAS, SchemaClasses.OTHER_ENTITY, SchemaClasses.POLYMER, SchemaClasses.SIMPLE_ENTITY]);

export function isEntity(obj: DatabaseObject): obj is PhysicalEntity {
  return physicalEntityClasses.has(obj.schemaClass);
}

export function isEWAS(obj: DatabaseObject): obj is EntityWithAccessionedSequence {
  return obj.schemaClass === SchemaClasses.EWAS;
}

const reactionLikeEventClasses: Set<string> = new Set([SchemaClasses.REACTION, SchemaClasses.BLACK_BOX_EVENT, SchemaClasses.POLYMERISATION, SchemaClasses.DEPOLYMERISATION, SchemaClasses.FAILED_REACTION, SchemaClasses.CELL_DEVELOPMENT_STEP]);

export function isRLE(obj: DatabaseObject): obj is ReactionLikeEvent {
  return reactionLikeEventClasses.has(obj.schemaClass);
}

export function isPathwayWithDiagram(obj: DatabaseObject): obj is Pathway {
  return isPathwayOrTLP(obj) && obj.hasDiagram;
}

const regulationClasses: Set<string> = new Set([SchemaClasses.REGULATION, SchemaClasses.NEGATIVE_REGULATION, SchemaClasses.NEGATIVE_GENE_EXPRESSION_REGULATION, SchemaClasses.POSITIVE_REGULATION, SchemaClasses.POSITIVE_GENE_EXPRESSION_REGULATION, SchemaClasses.REQUIREMENT]);

export function isRegulation(obj: Regulation | CatalystActivity | HasModifiedResidue): obj is Regulation {
  return 'schemaClass' in obj && regulationClasses.has(obj.schemaClass);
}

export function isCatalystActivity(obj: Regulation | CatalystActivity | HasModifiedResidue): obj is CatalystActivity {
  return 'schemaClass' in obj && obj.schemaClass === SchemaClasses.CATALYST_ACTIVITY;
}

export function isHasModifiedResidue(obj: Regulation | CatalystActivity | HasModifiedResidue): obj is HasModifiedResidue {
  return 'type' in obj && obj.type === 'modifiedResidue';
}

const modificationClasses: Set<string> = new Set([SchemaClasses.GROUP_MODIFIED_RESIDUE, SchemaClasses.CROSSLINKED_RESIDUE, SchemaClasses.INTER_CHAIN_CROSSLINKED_RESIDUE, SchemaClasses.INTRA_CHAIN_CROSSLINKED_RESIDUE]);

export function hasModification(obj: DatabaseObject): obj is GroupModifiedResidue | CrosslinkedResidue | InterChainCrosslinkedResidue | IntraChainCrosslinkedResidue {
  return modificationClasses.has(obj.schemaClass);
}

export function isReferenceGroup(obj: DatabaseObject): obj is ReferenceGroup {
  return obj.schemaClass === SchemaClasses.REFERENCE_GROUP;
}

/** Generic function to dynamic access child property
 *  T represents the type of the obj parameter, which must extend DatabaseObject.
 *  K is constrained to the keys of T, ensuring only valid keys of the given object type can be accessed.
 *  The function uses key in obj to check if the property exists on the object at runtime.
 *  If it does, it returns the value of the property. Otherwise, it returns undefined.
 */

export function getProperty<T extends DatabaseObject, K extends keyof T>(obj: T, key: K): T[K] | undefined {
  return key in obj ? obj[key] : undefined;
}
