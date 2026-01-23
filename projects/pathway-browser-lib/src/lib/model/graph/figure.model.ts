import {DatabaseObject} from "./database-object.model";

export interface HasFigure {
  figure?: Figure[];
}

export interface Figure extends DatabaseObject {
  url: string;
  schemaClass: "Figure"
}
