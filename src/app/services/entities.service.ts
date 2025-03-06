import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {environment} from "../../environments/environment";
import {PhysicalEntity} from "../model/graph/physical-entity/physical-entity.model";
import {map} from "rxjs";
import {DataStateService} from "./data-state.service";
import {ReferenceEntity} from "../model/graph/reference-entity/reference-entity.model";

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

  getTransformedExternalRef(refEntity: ReferenceEntity | undefined) {
    if (!refEntity) return [];
    const externalRef = {...refEntity};
    const properties = [
      {key: 'displayName', label: 'External Reference'},
      {key: 'geneName', label: 'Gene Names'},
      {key: 'chain', label: 'Chain'},
      {key: 'referenceGene', label: 'Reference Genes'},
      {key: 'referenceTranscript', label: 'Reference Transcript'}
    ];
    const results: { label: string, value: any }[] = [];
    for (const property of properties) {
      let value = externalRef[property.key];
      if (!value) continue;
      results.push({
        label: property.label || property.key,
        value: value
      });
    }
    return results;
  }


  getGroupedCrossReferences(refEntity: ReferenceEntity | undefined) {
    if (!refEntity || !refEntity.crossReference) return [];

    const crossRefs = [...refEntity.crossReference];
    const dbNames = [...new Set(crossRefs.map(ref => ref.databaseName))];

    return dbNames.map(dbName => ({
      databaseName: dbName,
      data: crossRefs.filter(ref => ref.databaseName === dbName)
    }));

  }


}
