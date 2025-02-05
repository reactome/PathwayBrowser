import {Pathway} from "./pathway.model";
import {Anatomy} from "../anatomy.model";

export interface CellLineagePath extends Pathway {
  tissue?: Anatomy;
}
