import {TranscriptionalModification} from "./transcriptional-modification.model";
import {DatabaseObject} from "../database-object.model";

export interface ModifiedNucleotide extends TranscriptionalModification {
  coordinate: number;
  modification: DatabaseObject;
}
