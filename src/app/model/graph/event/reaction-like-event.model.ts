import {Event} from "./event.model";
import {PhysicalEntity} from "../physical-entity/physical-entity.model";
import {Relationship} from "../relationship.model";

export interface ReactionLikeEvent extends Event {
  input: PhysicalEntity[];
  output: PhysicalEntity[];
  category: string
  reactionType: string;

  composedOf : Relationship.Has<Event>[]

}
