import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {environment} from "../../environments/environment";
import {PhysicalEntity} from "../model/graph/physical-entity/physical-entity.model";

@Injectable({
  providedIn: 'root'
})
export class EntitiesService {

  constructor(private http: HttpClient) {
  }

  getOtherForms(stId: string) {
    const url = `${environment.host}/ContentService/data/entity/${stId}/otherForms`;
    return this.http.get<PhysicalEntity[]>(url);
  }
}
