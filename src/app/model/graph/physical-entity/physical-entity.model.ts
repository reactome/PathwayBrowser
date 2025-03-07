import {DatabaseObject} from "../database-object.model";
import {InstanceEdit} from "../instance-edit.model";
import {CatalystActivity} from "../catalyst-activity.model";
import {CellType} from "../external-ontology/cell-type.model";
import {Relationship} from "../relationship.model";
import {DatabaseIdentifier} from "../database-identifier.model";


export interface PhysicalEntity extends DatabaseObject {
  stId: string
  definition: string;
  compartment: Relationship.HasCompartment[];

  name: string[];
  authored: InstanceEdit;
  catalystActivities: CatalystActivity[];
  cellType: CellType[];
  componentOf: Relationship.ComponentOf[];
  consumedByEvent: Relationship.InputOf[];
  crossReference: DatabaseIdentifier[];
  inferredTo: PhysicalEntity[];
  inferredFrom: PhysicalEntity[];


  speciesName: string;


  //Tree building
  composedOf: Relationship.Has<PhysicalEntity>[];
  type: string;


}
