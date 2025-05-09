import {PhysicalEntity} from "./physical-entity.model";
import {MarkerReference} from "../control-reference/marker-reference.model";
import {Anatomy} from "../external-ontology/anatomy.model";
import {EntityWithAccessionedSequence} from "./entity-with-accessioned-sequence.model";
import {Taxon} from "../taxon.model";

export interface Cell extends PhysicalEntity {
  markerReference: MarkerReference[];
  organ: Anatomy;
  proteinMarker: EntityWithAccessionedSequence[];
  rnaMarker: EntityWithAccessionedSequence[];
  species: Taxon[];
  tissue: Anatomy;
  tissueLayer: Anatomy;

}
