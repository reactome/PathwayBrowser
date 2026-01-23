import {computed, Injectable, signal} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {PhysicalEntity} from "../model/graph/physical-entity/physical-entity.model";
import {PathwayBrowserConfigService} from "./pathway-browser-config.service";
import {filter, map, Observable, of, take} from "rxjs";
import {DataStateService} from "./data-state.service";
import {ReferenceEntity} from "../model/graph/reference-entity/reference-entity.model";
import {DatabaseObject} from "../model/graph/database-object.model";
import {rxResource, toObservable} from "@angular/core/rxjs-interop";
import {ParticipantService} from "./participant.service";
import {DataKeys, Labels} from "../constants/constants";
import {isDefined, isRefEntity, isReferenceEntityStId, isReferenceSummary} from "./utils";

@Injectable({
  providedIn: 'root'
})
export class EntityService {

  constructor(private http: HttpClient,
              private dataStateService: DataStateService,
              private participant: ParticipantService,
              private config: PathwayBrowserConfigService) {
  }

  eventId = signal<string | undefined>(undefined);

  selectedElement$ = toObservable(this.dataStateService.selectedElement);

  _refEntities = rxResource({
    request: this.eventId,
    loader: ({request}) => {
      return request
        ? isReferenceEntityStId(request)
          ? this.selectedElement$.pipe(filter(isDefined), filter(isRefEntity), map(ref => [ref]), take(1))
          : this.participant.getReferenceEntities(request)
        : of(null);
    }
  });

  refEntities = computed(() => this._refEntities.value());

  getOtherForms(stId: string): Observable<PhysicalEntity[]> {
    const url = `${this.config.CONTENT_SERVICE}/data/entity/${stId}/otherForms`;
    return this.http.get<PhysicalEntity[]>(url);
  }

  getEntityInDepth<E extends DatabaseObject>(id: string | number, depth: number): Observable<E> {
    const url = `${this.config.CONTENT_SERVICE}/data/entity/${id}/in-depth`;
    return this.http.get<E>(url, {
      params: {
        includeRef: true,
        view: 'nested-aggregated',
        attributes: 'species,compartment,referenceEntity',
        maxDepth: depth,
      }
    }).pipe(map(this.dataStateService.flattenReferences))
  }

  getEventInDepth<E extends DatabaseObject>(id: string | number, depth: number): Observable<E> {
    const url = `${this.config.CONTENT_SERVICE}/data/event/${id}/in-depth`;
    return this.http.get<E>(url, {
      params: {
        includeRef: true,
        view: 'nested-aggregated',
        attributes: 'species,compartment',
        maxDepth: depth,
      }
    }).pipe(map(this.dataStateService.flattenReferences))
  }

  getTransformedExternalRef(refEntity: ReferenceEntity | undefined) {
    if (!refEntity) return [];
    const externalRef = {...refEntity};
    const properties = [
      {key: DataKeys.DISPLAY_NAME, label: Labels.EXTERNAL_REFERENCE},
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

  // Generic function to group by any property
  getGroupedData<T>(data: T[], getKey: (item: T) => string): Map<string, T[]> {
    const grouped = new Map<string, T[]>();

    // Loop over unique keys and group data by the key
    const uniqueKeys = [...new Set(data.map(item => getKey(item)))];

    uniqueKeys.forEach(key => {
      grouped.set(key, data.filter(item => getKey(item) === key));
    });

    return grouped;
  }

  loadRefEntities(id: string) {
    this.eventId.set(id);
  }

}
