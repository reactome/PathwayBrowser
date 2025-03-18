import {ControlReference} from "./control-reference.model";
import {CatalystActivity} from "../catalyst-activity.model";

export interface CatalystActivityReference extends ControlReference{
  catalystActivity: CatalystActivity;
}
