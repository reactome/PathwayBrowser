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
import {ReferenceGroup} from "../model/graph/reference-entity/reference-group.model";
import {ReplacedResidue} from "../model/graph/abstract-modified-residue/replaced-residue.model";
import {FragmentModification} from "../model/graph/abstract-modified-residue/fragment-modification.model";
import HasModifiedResidue = Relationship.HasModifiedResidue;
import {ReferenceMolecule} from "../model/graph/reference-entity/reference-molecule.model";
import {Publication} from "../model/graph/publication/publication.model";
import {Book} from "../model/graph/publication/book.model";

export function isDefined<T>(value: T | undefined | null): value is T {
  return value !== undefined && value !== null
}

export function sortByYearDescending(refs: Publication[]) {

  // Filter refs (i.e., LiteratureReference or Book)
  const withYear = refs.filter(isRefOrBook);

  withYear.sort((a, b) => {
    if (a.year && b.year) return 0;
    if (a.year) return 1;
    if (b.year) return -1;
    return b.year - a.year;
  });

  // Return the sorted items along with the others (without year) at the end
  const withoutYear = refs.filter(ref => !isRefOrBook(ref));
  return [...withYear, ...withoutYear];
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

const physicalEntityClasses: Set<String> = new Set([SchemaClasses.PE, SchemaClasses.COMPLEX, SchemaClasses.DRUG, SchemaClasses.CHEMICAL_DRUG, SchemaClasses.PROTEIN_DRUG, SchemaClasses.RNA_DRUG, SchemaClasses.ENTITY_SET, SchemaClasses.DEFINED_SET, SchemaClasses.CANDIDATE_SET, SchemaClasses.GENOME_ENCODED_ENTITY,
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


// Checks whether a given property exists in an object
export function hasProperty<K extends keyof DatabaseObject>(obj: DatabaseObject, property: K): obj is DatabaseObject & Record<K, unknown> {
  return property in obj;
}

const fragmentModificationClasses: Set<string> = new Set([SchemaClasses.FRAGMENT_MODIFICATION, SchemaClasses.FRAGMENT_DELETION_MODIFICATION, SchemaClasses.FRAGMENT_INSERTION_MODIFICATION, SchemaClasses.FRAGMENT_REPLACED_MODIFICATION]);

export function isFragmentModification(obj: DatabaseObject): obj is FragmentModification {
  return fragmentModificationClasses.has(obj.schemaClass);
}


export function isReplacedResidue(obj: DatabaseObject): obj is ReplacedResidue {
  return obj.schemaClass === SchemaClasses.REPLACED_RESIDUE || obj.schemaClass === SchemaClasses.NONSENSE_MUTATION;
}

export function isReferenceGroup(obj: DatabaseObject): obj is ReferenceGroup {
  return obj.schemaClass === SchemaClasses.REFERENCE_GROUP;
}

export function isReferenceMolecule(obj: DatabaseObject): obj is ReferenceMolecule {
  return obj.schemaClass === SchemaClasses.REFERENCE_MOLECULE
}

export function isRefOrBook(publication: Publication): publication is LiteratureReference | Book {
  return publication.schemaClass === SchemaClasses.LITERATURE_REFERENCE || publication.schemaClass === SchemaClasses.BOOK
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
