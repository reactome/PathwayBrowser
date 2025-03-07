import {DatabaseObject} from "./database-object.model";
import {PhysicalEntity} from "./physical-entity/physical-entity.model";
import {Compartment} from "./go-term/compartment.model";
import {Event} from "./event/event.model";
import {Person} from "./person.model";
import {Publication} from "./publication/publication.model";
import {Polymer} from "./physical-entity/polymer.model";


export namespace Relationship {

  export interface Has<O extends DatabaseObject, Type extends string = string> {
    type: Type;
    stoichiometry: number;
    order: number;
    element: O;
  }

  export interface HasCandidate extends Has<PhysicalEntity, "candidate"> {
  }

  export interface HasCompartment extends Has<Compartment, "compartment"> {
  }

  export interface HasComponent extends Has<PhysicalEntity, "component"> {
  }

  export interface ComponentOf extends Has<PhysicalEntity, "componentOf"> {
  }

  export interface HasEncapsulatedEvent extends Has<Event, "encapsulatedEvent"> {
  }

  export interface HasEvent extends Has<Event, "event"> {
  }

  export interface HasMember extends Has<Event, "member"> {
  }

  export interface HasModifiedResidue extends Has<Event, "modifiedResidue"> {
  }

  export interface Input extends Has<PhysicalEntity, "input"> {
  }

  export interface Output extends Has<PhysicalEntity, "output"> {
  }

  export interface InputOf extends Has<PhysicalEntity, "inputOf"> {
  }

  export interface OutputOf extends Has<PhysicalEntity, "outputOf"> {
  }

  export interface Author extends Has<Person, "author"> {
  }

  export interface HasPublication extends Has<Publication, "publication"> {
  }

  export interface RepeatedUnit extends Has<PhysicalEntity, "repeatedUnit"> {
  }

  export interface RepeatedUnitOf extends Has<Polymer, "repeatedUnitOf"> {
  }

}




