import {ReferenceEntity} from "./reference-entity.model";


export interface ReferenceTherapeutic extends ReferenceEntity {
  abbreviation: string;
  approvalSource: string[];
  approved: boolean;
  inn: string;
  type: string;
}
