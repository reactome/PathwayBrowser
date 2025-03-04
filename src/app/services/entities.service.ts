import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {environment} from "../../environments/environment";
import {PhysicalEntity} from "../model/graph/physical-entity/physical-entity.model";
import {map} from "rxjs";
import {DataStateService} from "./data-state.service";

@Injectable({
  providedIn: 'root'
})
export class EntitiesService {

  constructor(private http: HttpClient, private dataStateService: DataStateService) {
  }

  getOtherForms(stId: string) {
    const url = `${environment.host}/ContentService/data/entity/${stId}/otherForms`;
    return this.http.get<PhysicalEntity[]>(url);
  }

  getEntityInDepth(stId: string) {
    const url = `${environment.host}/ContentService/data/entity/${stId}/in-depth?maxDepth=1&attributes=species%2Ccompartment&view=nested-aggregated&includeRef=true`;
    return this.http.get<PhysicalEntity>(url).pipe(map(this.dataStateService.flattenReferences))
  }


}
