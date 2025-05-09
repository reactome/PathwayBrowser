import {ControlReference} from "./control-reference.model";
import {Cell} from "../physical-entity/cell.model";
import {EntityWithAccessionedSequence} from "../physical-entity/entity-with-accessioned-sequence.model";

export interface MarkerReference extends ControlReference {
  cell: Cell[];
  marker: EntityWithAccessionedSequence;
}
