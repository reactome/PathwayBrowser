import {DatabaseObject} from "../database-object.model";
import {Compartment} from "../../diagram.model";
import {InstanceEdit} from "../instance-edit.model";
import {Complex} from "./complex.model";
import {ReactionLikeEvent} from "../event/reaction-like-event.model";
import {CatalystActivity} from "../catalyst-activity.model";
import {CellType} from "../external-ontology/cell-type.model";
import {ComposedOf} from "../composed-of.model";


export interface PhysicalEntity extends DatabaseObject {
  stId: string
  definition: string;
  compartment?: Compartment[];

  name:string[];
  authored:InstanceEdit;
  catalystActivities: CatalystActivity[];
  cellType: CellType[];
  componentOf: Complex[];
  consumedByEvent:ReactionLikeEvent[];
  crossReference: DatabaseObject[];
  inferredTo: PhysicalEntity[];
  inferredFrom: PhysicalEntity[];


  speciesName:string;


  //Tree building
  composedOf?: ComposedOf[];
  type:string;


}
