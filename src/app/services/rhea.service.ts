import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {map} from "rxjs";
import {DatabaseIdentifier} from "../model/graph/database-identifier.model";


export interface Rhea {
  equation: string;
  left: Participant[];
  right: Participant[];
  id: string; // rhea id
  url: string;
  participants: Participant[]; // left + right
}

export interface Participant {
  id: number;
  label: string;
  position: string;
  uniqueId: string;
  idprefix: string; // rhea-comp | chebi , backend returns idprefix
  reactivePart: Participant[];
}


@Injectable({
  providedIn: 'root'
})
export class RheaService {


  constructor(private http: HttpClient) {
  }

  getRheaJson(xRef: DatabaseIdentifier) {

    const identifier = xRef.identifier

    const url = `https://www.rhea-db.org/rhea/${identifier}/json`;
    return this.http.get<Rhea>(url).pipe(
      map(response => ({
        equation: response.equation,
        id: identifier,
        url: xRef.url,
        participants: [
          ...response.left.map(entry => ({
            ...entry,
            uniqueId: entry.id + '_left_' + entry.position,
            position: 'left'
          })),
          ...response.right.map(entry => ({
            ...entry,
            uniqueId: entry.id + '_right_' + entry.position,
            position: 'right'
          }))
        ]
      } as unknown as Rhea))
    )
  }
}
