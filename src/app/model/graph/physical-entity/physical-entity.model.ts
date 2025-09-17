import {DatabaseObject} from "../database-object.model";
import {InstanceEdit} from "../instance-edit.model";
import {CatalystActivity} from "../catalyst-activity.model";
import {CellType} from "../external-ontology/cell-type.model";
import {Relationship} from "../relationship.model";
import {DatabaseIdentifier} from "../database-identifier.model";
import {Disease} from "../external-ontology/disease.model";
import {MarkerReference} from "../control-reference/marker-reference.model";
import {InDepth} from "../in-depth.model";


export interface PhysicalEntity extends DatabaseObject, InDepth {
  stId: string
  definition: string;
  compartment: Relationship.HasCompartment[];

  name: string[];
  authored: InstanceEdit;
  catalystActivities: CatalystActivity[];
  cellType: CellType[];
  componentOf: Relationship.ComponentOf[];
  consumedByEvent: Relationship.InputOf[];
  crossReference?: DatabaseIdentifier[];
  inferredTo: PhysicalEntity[];
  inferredFrom: PhysicalEntity[];
  inDisease?: Boolean;
  disease?: Disease[];
  markingReferences?: MarkerReference[];


  speciesName: string;


  //Tree building
  composedOf: Relationship.Has<PhysicalEntity>[];
  type: string;


}
