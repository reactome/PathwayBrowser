import {ReferenceEntity} from "./reference-entity.model";
import {Species} from "../species.model";

export interface ReferenceSequence extends ReferenceEntity {
  description: string;
  geneName: string[];
  isSequenceChanged: boolean;
  keyword: string[];
  secondaryIdentifier: string[];
  sequenceLength: number;
  species?: Species;
}
