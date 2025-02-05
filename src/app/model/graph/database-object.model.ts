import {InstanceEdit} from "./instance-edit.model";

export interface DatabaseObject {
  [key: string]: any;

  dbId: number;
  stId?: string;
  displayName: string;
  schemaClass: string;
  modified?: InstanceEdit;
  created?: InstanceEdit;

  hasIcon?: boolean //help to determine if we have icon from Icon library, for instance, PTEN has icon R-ICO-013990
}
