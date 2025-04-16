import {InstanceEdit} from "./instance-edit.model";
import {Relationship} from "./relationship.model";

export interface DatabaseObject {
  [key: string]: any;

  dbId: number;
  stId?: string;
  displayName: string;
  schemaClass: string;
  modified?: InstanceEdit;
  created?: InstanceEdit;

  composedOf?: Relationship.Has<DatabaseObject>[];
  isLoaded?: boolean;

}
