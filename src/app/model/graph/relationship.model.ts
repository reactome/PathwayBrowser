import {DatabaseObject} from "./database-object.model";
import {PhysicalEntity} from "./physical-entity/physical-entity.model";
import {Compartment} from "./go-term/compartment.model";
import {Event} from "./event/event.model";
import {Person} from "./person.model";
import {Publication} from "./publication/publication.model";
import {Polymer} from "./physical-entity/polymer.model";
import {Type} from "../../constants/constants";
import {AbstractModifiedResidue} from "./abstract-modified-residue/abstract-modified-residue.model";


export namespace Relationship {

  export interface Has<O extends DatabaseObject, Type extends string = string> {
    type: Type;
    stoichiometry: number;
    order: number;
    element: O;
  }

  export interface HasCandidate extends Has<PhysicalEntity, Type.CANDIDATE> {
  }

  export interface HasCompartment extends Has<Compartment, Type.COMPARTMENT> {
  }

  export interface HasComponent extends Has<PhysicalEntity, Type.COMPONENT> {
  }

  export interface ComponentOf extends Has<PhysicalEntity, Type.COMPONENT_OF> {
  }

  export interface HasEncapsulatedEvent extends Has<Event, Type.ENCAPSULATED_EVENT> {
  }

  export interface HasEvent extends Has<Event, Type.EVENT> {
  }

  export interface HasMember extends Has<Event, Type.MEMBER> {
  }

  export interface HasModifiedResidue extends Has<AbstractModifiedResidue, Type.MODIFIED_RESIDUE> {
  }

  export interface Input extends Has<PhysicalEntity, Type.INPUT> {
  }

  export interface Output extends Has<PhysicalEntity, Type.OUTPUT> {
  }

  export interface InputOf extends Has<PhysicalEntity, Type.INPUT_OF> {
  }

  export interface OutputOf extends Has<PhysicalEntity, Type.OUTPUT_OF> {
  }

  export interface Author extends Has<Person, Type.AUTHOR> {
  }

  export interface HasPublication extends Has<Publication, Type.PUBLICATION> {
  }

  export interface RepeatedUnit extends Has<PhysicalEntity, Type.REPEATED_UNIT> {
  }

  export interface RepeatedUnitOf extends Has<Polymer, Type.REPEATED_UNIT_OF> {
  }

}




