import {DatabaseObject} from "../database-object.model";
import {Compartment} from "../../diagram.model";


export interface PhysicalEntity extends DatabaseObject {
  stId: string
  definition: string;

  // Not in the date model
  speciesName?: string;
  compartment?: Compartment[];

}
