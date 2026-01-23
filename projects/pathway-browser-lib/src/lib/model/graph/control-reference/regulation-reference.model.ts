import {ControlReference} from "./control-reference.model";
import {Regulation} from "../Regulation/regulation.model";

export interface RegulationReference extends ControlReference {
  regulatedBy: Regulation;
}
