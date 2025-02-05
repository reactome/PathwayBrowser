import {Event} from "./event.model";

export interface ReactionLikeEvent extends Event {
  input: Event[];
  output: Event[];
  category: string
  reactionType: string;
}
