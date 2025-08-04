import {Injectable} from '@angular/core';
import {DataStateService} from "./data-state.service";
import {map, Observable} from "rxjs";
import {ReferenceEntity} from "../model/graph/reference-entity/reference-entity.model";
import {environment} from "../../environments/environment";
import {HttpClient} from "@angular/common/http";
import {PropertyType} from "../details/tabs/molecule-tab/molecule-tab.component";
import {extractFromSpace} from "./utils";
import {SchemaClasses} from "../constants/constants";


export interface Molecule {
  dbId: number;
  identifier: string;
  schemaClass: string;
  displayName: string;
  icon: string;
  displayIcon:string;
  url: string;
  formattedName: string;
  type: string;
}

export interface Participant {
  peDbId: number;
  displayName: string;
  schemaClass: string;
  refEntities: Molecule[];
}


@Injectable({
  providedIn: 'root'
})
export class ParticipantService {

  constructor(private http: HttpClient, private dataState: DataStateService) {

  }


  getParticipants(stId: string): Observable<Participant[]> {
    const url = `${environment.host}/ContentService/data/participants/${stId}`;
    return this.http.get<Participant[]>(url).pipe(
      map(participants =>
        participants.map((participant) => ({
          ...participant,
          refEntities: participant.refEntities.map(molecule => ({
            ...molecule,
            formattedName: this.getNameAndType(molecule).name, // UniProt:P78396 CCNA1 ➡️ CCNA1
            type: this.getNameAndType(molecule).type,
            displayIcon: this.getDisplayIcon(molecule),// Correct DNA/RNA icon
          }))
        })))
    );
  }


  getType(molecule: Molecule): { type: string; name: string } {
    let type = '';
    let name = '';

    const schemaClass = molecule.schemaClass;
    switch (schemaClass) {
      case SchemaClasses.EWAS:
      case SchemaClasses.REFERENCE_GENE_PRODUCT:
      case SchemaClasses.REFERENCE_ISOFORM:
        type = PropertyType.PROTEINS;
        name = extractFromSpace(molecule.displayName, false);

        break;
      case SchemaClasses.REFERENCE_RNA_SEQUENCE:
      case SchemaClasses.REFERENCE_DNA_SEQUENCE:
        type = PropertyType.SEQUENCES;
        name = extractFromSpace(molecule.displayName, false);

        break;
      case SchemaClasses.SIMPLE_ENTITY:
      case SchemaClasses.REFERENCE_MOLECULE:
        type = PropertyType.CHEMICAL_COMPOUNDS;
        name = extractFromSpace(molecule.displayName, true);

        break;
      case SchemaClasses.REFERENCE_THERAPEUTIC:
        type = PropertyType.DRUG;
        name = extractFromSpace(molecule.displayName, true);

        break;
      default:
        type = PropertyType.OTHERS;
        name = molecule.displayName;

    }

    return {type, name};
  }


  getReferenceEntities(stId: string): Observable<ReferenceEntity[]> {
    const url = `${environment.host}/ContentService/data/participants/${stId}/referenceEntities`;
    return this.http.get<ReferenceEntity[]>(url);
  }

}
