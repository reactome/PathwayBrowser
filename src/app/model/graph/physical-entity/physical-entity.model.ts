import {DatabaseObject} from "../database-object.model";
import {Compartment} from "../../diagram.model";


export interface PhysicalEntity extends DatabaseObject {
  stId: string
  definition: string;
  compartment?: Compartment[];
}
