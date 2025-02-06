import {DatabaseObject} from "../database-object.model";
import {Summation} from "../summation.model";
import {ReviewStatus} from "../review-status.model";
import {LiteratureReference} from "../publication/literature-reference.model";
import {InstanceEdit} from "../instance-edit.model";
import {Compartment} from "../compartment.model";

export interface Event extends DatabaseObject {
  stId: string;
  authored: InstanceEdit[];
  reviewed: InstanceEdit[];
  literatureReference?: LiteratureReference[];
  isInferred: boolean;
  releaseStatus: string;
  isInDisease: boolean;
  summation: Summation[];
  reviewStatus: ReviewStatus;
  name: string[];
  compartment?: Compartment[];


  // not from API endpoint but are needed in the tree view
  isSelected?: boolean;
  isHovered?: boolean;
  ancestors: Event[];
  parent: Event;

}
