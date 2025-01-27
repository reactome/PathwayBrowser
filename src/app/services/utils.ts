import {Event} from "../model/graph/event.model";
import {DatabaseObject} from "../model/graph/database-object.model";
import {Pathway} from "../model/graph/pathway.model";
import {ReactionLikeEvent} from "../model/graph/reaction-like-event.model";
import {PhysicalEntity} from "../model/graph/physical-entity/physical-entity.model";
import {TopLevelPathway} from "../model/graph/top-level-pathway.model";
import {CellLineagePath} from "../model/graph/cell-lineage-path.model";
import {EntityWithAccessionedSequence} from "../model/graph/physical-entity/entity-with-accessioned-sequence.model";
import {LiteratureReference} from "../model/graph/publication/literature-reference.model";

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
  return obj.schemaClass === "Pathway";
}

export function isTLP(obj: DatabaseObject): obj is TopLevelPathway {
  return obj.schemaClass === "TopLevelPathway";
}

export function isCellLineagePath(obj: DatabaseObject): obj is CellLineagePath {
  return obj.schemaClass === "CellLineagePathway";
}

export function isPathwayOrTLP(obj: DatabaseObject): obj is Pathway | TopLevelPathway | CellLineagePath {
  return isPathway(obj) || isTLP(obj) || isCellLineagePath(obj);
}

const physicalEntityClasses = new Set(['PhysicalEntity', 'Complex', 'Drug', 'ChemicalDrug', 'ProteinDrug', 'RNADrug', 'EntitySet', 'CandidateSet', 'GenomeEncodedEntity', 'EntityWithAccessionedSequence',
  'EntityWithAccessionedSequence', 'OtherEntity', 'Polymer', 'SimpleEntity']);

export function isEntity(obj: DatabaseObject): obj is PhysicalEntity {
  return physicalEntityClasses.has(obj.schemaClass);
}

export function isEWAS(obj: DatabaseObject): obj is EntityWithAccessionedSequence {
  return obj.schemaClass === "EntityWithAccessionedSequence";
}

const reactionLikeEventClasses = new Set(['Reaction', 'BlackBoxEvent', 'Polymerisation', 'Depolymerisation', 'FailedReaction', 'CellDevelopmentStep']);

export function isRLE(obj: DatabaseObject): obj is ReactionLikeEvent {
  return reactionLikeEventClasses.has(obj.schemaClass);
}

export function isPathwayWithDiagram(obj: DatabaseObject): obj is Pathway {
  return isPathwayOrTLP(obj) && obj.hasDiagram;
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
