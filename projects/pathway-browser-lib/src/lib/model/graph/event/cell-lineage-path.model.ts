import {Pathway} from "./pathway.model";
import {Anatomy} from "../external-ontology/anatomy.model";

export interface CellLineagePath extends Pathway {
  tissue?: Anatomy;
}
