import {Publication} from "./publication.model";

export interface URL extends Publication {
  uniformResourceLocator: string
}
