import {Injectable} from '@angular/core';
import {DataStateService} from "./data-state.service";
import {Observable} from "rxjs";
import {ReferenceEntity} from "../model/graph/reference-entity/reference-entity.model";
import {environment} from "../../environments/environment";
import {HttpClient} from "@angular/common/http";


export interface ParticipantRefEntity {
  dbId: number;
  identifier: string;
  schemaClass: string;
  displayName: string;
  icon: string;
  url: string;


}

export interface Participant {
  peDbId: number;
  displayName: string;
  schemaClass: string;
  refEntities: ParticipantRefEntity[];
}


@Injectable({
  providedIn: 'root'
})
export class ParticipantService {

  constructor(private http: HttpClient, private dataState: DataStateService) {

  }


  getParticipants(stId: string): Observable<Participant[]> {
    const url = `${environment.host}/ContentService/data/participants/${stId}`;
    return this.http.get<Participant[]>(url);
  }


  getReferenceEntities(stId: string): Observable<ReferenceEntity[]> {
    const url = `${environment.host}/ContentService/data/participants/${stId}/referenceEntities`;
    return this.http.get<ReferenceEntity[]>(url);
  }

}
