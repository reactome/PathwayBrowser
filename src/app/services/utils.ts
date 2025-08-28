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
import {ReferenceEntity} from "../model/graph/reference-entity/reference-entity.model";
import {Molecule} from "./participant.service";
import {SummaryEntity} from "../model/graph/physical-entity/summary-entity.model";

export function isDefined<T>(value: T | undefined | null): value is T {
  return value !== undefined && value !== null
}

export function groupAndSortBy<E, K>(elements: E[], getKey: (element: E) => K, orderBy: (key1: K, key2: K) => number): {
  key: K,
  elements: E[]
}[] {
  const grouped = new Map<K, E[]>();
  elements.forEach(element => grouped.set(getKey(element), [...(grouped.get(getKey(element)) || []), element]))
  return [...grouped.keys()].sort(orderBy).map(key => ({key, elements: grouped.get(key)!}));
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
  return isExactlyPathway(obj) || isExactlyTLP(obj) || isExactlyCellLineagePath(obj) || isRLE(obj);
}

export function isExactlyPathway(obj: DatabaseObject): obj is Pathway {
  return obj.schemaClass === SchemaClasses.PATHWAY;
}

export function isExactlyTLP(obj: DatabaseObject): obj is TopLevelPathway {
  return obj.schemaClass === SchemaClasses.TLP;
}

export function isExactlyCellLineagePath(obj: DatabaseObject): obj is CellLineagePath {
  return obj.schemaClass === SchemaClasses.CELL_LINEAGE_PATH;
}

export function isPathway(obj: DatabaseObject): obj is Pathway | TopLevelPathway | CellLineagePath {
  return isExactlyPathway(obj) || isExactlyTLP(obj) || isExactlyCellLineagePath(obj);
}

const physicalEntityClasses: Set<String> = new Set([SchemaClasses.PE, SchemaClasses.COMPLEX, SchemaClasses.DRUG, SchemaClasses.CHEMICAL_DRUG, SchemaClasses.PROTEIN_DRUG, SchemaClasses.RNA_DRUG, SchemaClasses.ENTITY_SET, SchemaClasses.DEFINED_SET, SchemaClasses.CANDIDATE_SET, SchemaClasses.GENOME_ENCODED_ENTITY,
  SchemaClasses.EWAS, SchemaClasses.OTHER_ENTITY, SchemaClasses.POLYMER, SchemaClasses.SIMPLE_ENTITY, SchemaClasses.CELL, SchemaClasses.SUMMARY_ENTITY]);

export function isPhysicalEntity(obj: DatabaseObject): obj is PhysicalEntity {
  return physicalEntityClasses.has(obj.schemaClass);
}

export function isReferenceSummary(obj: DatabaseObject): obj is SummaryEntity {
  return (obj as SummaryEntity).summarisedEntities !== undefined;
}

const ReferenceEntityClasses: Set<string> = new Set([
  SchemaClasses.REFERENCE_ENTITY,
  SchemaClasses.REFERENCE_GROUP,
  SchemaClasses.REFERENCE_MOLECULE,
  SchemaClasses.REFERENCE_SEQUENCE,
  SchemaClasses.REFERENCE_DNA_SEQUENCE,
  SchemaClasses.REFERENCE_GENE_PRODUCT,
  SchemaClasses.REFERENCE_ISOFORM,
  SchemaClasses.REFERENCE_RNA_SEQUENCE,
  SchemaClasses.REFERENCE_THERAPEUTIC,
  SchemaClasses.SUMMARY_ENTITY,
]);

export function isRefEntity(obj: DatabaseObject): obj is ReferenceEntity {
  return ReferenceEntityClasses.has(obj.schemaClass);
}

export function isEWAS(obj: DatabaseObject): obj is EntityWithAccessionedSequence {
  return obj.schemaClass === SchemaClasses.EWAS;
}

const reactionLikeEventClasses: Set<string> = new Set([
  SchemaClasses.REACTION,
  SchemaClasses.BLACK_BOX_EVENT,
  SchemaClasses.POLYMERISATION,
  SchemaClasses.DEPOLYMERISATION,
  SchemaClasses.FAILED_REACTION,
  SchemaClasses.CELL_DEVELOPMENT_STEP
]);

export function isRLE(obj: DatabaseObject): obj is ReactionLikeEvent {
  return reactionLikeEventClasses.has(obj.schemaClass);
}

// todo: simplify ? introduce relationship?
// All molecules at Molecules tab
const moleculeClasses: Set<string> = new Set([
  SchemaClasses.EWAS,
  SchemaClasses.REFERENCE_GENE_PRODUCT,
  SchemaClasses.REFERENCE_ISOFORM,
  SchemaClasses.REFERENCE_RNA_SEQUENCE,
  SchemaClasses.REFERENCE_DNA_SEQUENCE,
  SchemaClasses.SIMPLE_ENTITY,
  SchemaClasses.REFERENCE_MOLECULE,
  SchemaClasses.REFERENCE_THERAPEUTIC
])

export function isMolecule(obj: DatabaseObject): obj is Molecule {
  return moleculeClasses.has(obj.schemaClass);
}


export function isPathwayWithDiagram(obj: DatabaseObject): obj is Pathway {
  return isPathway(obj) && obj.hasDiagram;
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

export function isSelectableObject(obj: DatabaseObject): obj is Event | PhysicalEntity {
  return isEvent(obj) || isPhysicalEntity(obj);
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


/**
 * If any value among the representative sample has an exponent part above +3 or bellow -3, then it should be scientificFormat.
 *
 * @param representativeSample e.g. [firstValue, lastValue, min, max]
 */
export const shouldBeScientificFormat = (representativeSample: number[]) => representativeSample.some(shouldBeScientificFormatValue)

/**
 * if value has an exponent part above +3 or bellow -3, then it should be scientificFormat
 * @param value a number
 */
const shouldBeScientificFormatValue = (value: number) => parseInt(value.toExponential(0).split(/e[+-]/)[1]) > 3;


export type ArrayStats = { min: number, max: number, average: number, sum: number, multiValued?: boolean };

export function getArrayStats(values: number[]): ArrayStats {
  if (values === undefined || values.length === 0) return {min: 0, max: 0, average: 0, sum: 0, multiValued: false};
  const summary: ArrayStats = values.reduce((acc: ArrayStats, value) => {
    if (value < acc.min) acc.min = value;
    if (value > acc.max) acc.max = value;
    acc.sum += value;
    return acc;
  }, {min: Number.MAX_VALUE, max: Number.MIN_VALUE, sum: 0, average: 0});
  summary.average = summary.sum / values.length
  summary.multiValued = values.length > 1
  return summary;
}


/**
 * J01866EMBL:J01866 5.8S rRNA ➡️ J01866
 * ENSG00000001630ENSEMBL:ENSG00000001630 CYP51A1 ➡️ ENSG00000001630
 * UniProt:A0A183 LCE6A ➡️ A0A183
 * @param value
 */
export function extractIdAfterColon(value: string): string {
  if (!value) return '';

  const colonIndex = value.indexOf(':');
  if (colonIndex === -1) return '';

  const afterColon = value.substring(colonIndex + 1).trim();
  const spaceIndex = afterColon.indexOf(' ');

  return spaceIndex !== -1 ? afterColon.substring(0, spaceIndex) : afterColon;
}


/**
 * ripasudil  [Guide to Pharmacology:10423] ➡️ 10423
 * rosiglitazone [Guide to Pharmacology:1056] ➡️ 1056
 * @param value
 */
export function extractIdInBrackets(value: string): string {
  const match = value.match(/\[.*?:([^\]\s]+)\]/);
  return match ? match[1] : '';
}


/**
 * UniProt:P11142 HSPA8 ➡️ (default behavior) HSPA8
 * UniProt:P11142 HSPA8 ➡️ True UniProt:P11142
 * @param input
 * @param getBeforeSpace
 */
export function extractFromSpace(input: string, getBeforeSpace: boolean = false): string {
  if (!input) return '';

  const trimmed = input.trim();

  if (getBeforeSpace) {
    const index = trimmed.indexOf(' ');
    return index !== -1 ? trimmed.substring(0, index) : trimmed;
  } else {
    const index = trimmed.lastIndexOf(' ');
    return index !== -1 ? trimmed.substring(index + 1) : trimmed;
  }
}

