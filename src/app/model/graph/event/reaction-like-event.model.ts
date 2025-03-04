import {Event} from "./event.model";
import {PhysicalEntity} from "../physical-entity/physical-entity.model";
import {ComposedOf} from "../composed-of.model";

export interface ReactionLikeEvent extends Event {
  input: PhysicalEntity[];
  output: PhysicalEntity[];
  category: string
  reactionType: string;

  composedOf : ComposedOf[]

}
