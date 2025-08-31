import {Event} from "./event.model";
import {PhysicalEntity} from "../physical-entity/physical-entity.model";
import {Relationship} from "../relationship.model";
import {Anatomy} from "../external-ontology/anatomy.model";

export interface ReactionLikeEvent extends Event {
  input: PhysicalEntity[];
  output: PhysicalEntity[];
  category: string
  reactionType: string;

  composedOf : Relationship.Has<Event>[]

}

export interface BlackBoxEvent extends ReactionLikeEvent {
  templateEvent: Event;
  schemaClass: 'BlackBoxEvent'
}

export interface CellDevelopmentStep extends ReactionLikeEvent {
  tissue: Anatomy
  schemaClass: 'CellDevelopmentStep'
}

export interface Polymerisation extends ReactionLikeEvent {
  schemaClass: 'Polymerisation'
}

export interface Depolymerisation extends ReactionLikeEvent {
  schemaClass: 'Depolymerisation'
}

export interface FailedReaction extends ReactionLikeEvent {
  schemaClass: 'FailedReaction'
}

export interface Reaction extends ReactionLikeEvent {
  reverseReaction: Reaction;
  schemaClass: 'Reaction'
}
