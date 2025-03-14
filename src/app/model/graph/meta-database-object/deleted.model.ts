import {MetaDatabaseObject} from "./meta-database-object.model";
import {DeletedInstance} from "./deleted-instance.model";
import {DeletedControlledVocabulary} from "../controlled-vocabulary/deleted-controlled-vocabulary.model";

export interface Deleted extends MetaDatabaseObject {
  curatorComment:string;
  deletedInstance: DeletedInstance[];
  deletedInstanceDbId: number;
  reason: DeletedControlledVocabulary;
  //replacementInstances: Deletable[];
}
