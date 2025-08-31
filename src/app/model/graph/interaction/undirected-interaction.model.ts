import {Interaction} from "./interaction.model";
import {ReferenceEntity} from "../reference-entity/reference-entity.model";

export interface UndirectedInteraction extends Interaction {
  interactor: ReferenceEntity[]
  schemaClass: 'UndirectedInteraction'
}
