import {DatabaseObject} from "./database-object.model";
import {PhysicalEntity} from "./physical-entity/physical-entity.model";
import {Publication} from "./publication/publication.model";
import {GO_MolecularFunction} from "./go-term/go-molecular-function.model";

export interface CatalystActivity extends DatabaseObject {
  physicalEntity: PhysicalEntity;
  literatureReference?: Publication[];
  activity?: GO_MolecularFunction;
  activeUnit?: PhysicalEntity[];
}
