import {DatabaseObject} from "../database-object.model";
import {PhysicalEntity} from "../physical-entity/physical-entity.model";
import {GO_MolecularFunction} from "../go-term/go-molecular-function.model";
import {InstanceEdit} from "../instance-edit.model";
import {Publication} from "../publication/publication.model";
import {ReactionLikeEvent} from "../event/reaction-like-event.model";
import {Summation} from "../summation.model";
import {GO_BiologicalProcess} from "../go-term/go-biological-process.model";

export interface Regulation extends DatabaseObject {
  activeUnit: PhysicalEntity[];
  activity: GO_MolecularFunction;
  authored: InstanceEdit;
  edited: InstanceEdit[]
  goBiologicalProcess: GO_BiologicalProcess;
  inferredFrom: Regulation[]
  inferredTo: Regulation[];
  literatureReference: Publication[];
  regulatedEntity: ReactionLikeEvent[];
  regulator: PhysicalEntity;
  releaseDate: string;
  reviewed: InstanceEdit[];
  revised: InstanceEdit[];
  summation: Summation[]

}
