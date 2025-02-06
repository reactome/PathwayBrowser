import {DatabaseObject} from "../database-object.model";
import {DatabaseIdentifier} from "../database-identifier.model";
import {ReferenceDNASequence} from "./reference-dna-sequence.model";


export interface ReferenceEntity extends DatabaseObject {
  identifier: string;
  url: string;
  crossReference: DatabaseIdentifier[];

}
