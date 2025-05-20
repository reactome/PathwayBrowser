import {Publication} from "./publication.model";
import {Affiliation} from "../affiliation.model";

export interface Book extends Publication {
  ISBN: string;
  chapterTitle: string;
  pages: string;
  publisher: Affiliation;
  year: number
}
