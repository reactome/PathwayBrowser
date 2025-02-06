import {computed, Injectable} from '@angular/core';
import {UrlStateService} from "./url-state.service";
import {rxResource} from "@angular/core/rxjs-interop";
import {Event} from "../model/graph/event/event.model";
import {map, Observable, of} from "rxjs";
import {JSOGDeserializer, JSOGObject} from "../utils/JSOGDeserializer";
import {environment} from "../../environments/environment";
import {HttpClient} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class DataStateService {
  private _currentPathway = rxResource({
    request: () => this.state.pathwayId(),
    loader: (params) => this.fetchEnhancedData(params.request)
  })

  private _ancestors = rxResource({
    request: () => this.state.pathwayId(),
    loader: (params) => this.fetchAncestors(params.request)
  })

  public currentPathway = computed(() => {
    const currentPathway = this._currentPathway.value();
    if (currentPathway) {
      currentPathway.ancestors = this._ancestors.value() || [];
    }
    return currentPathway;
  })

  private _selectedElement = rxResource({
    request: () => this.state.select(),
    loader: (params) => this.fetchEnhancedData(params.request)
  })

  public selectedElement = this._selectedElement.asReadonly().value


  constructor(private state: UrlStateService, private http: HttpClient) {
  }

  fetchEnhancedData(stId: string | null): Observable<Event | undefined> {
    let url = `${environment.host}/ContentService/data/query/enhanced/${stId}?includeRef=true`;
    if (stId === null) return of();
    return this.http.get<Event>(url).pipe(map(this.flattenReferences))
  }

  fetchAncestors(stId: string | null): Observable<Event[]> {
    let url = `${environment.host}/ContentService/data/event/${stId}/ancestors?includeRef=true`;
    if (stId === null) return of();
    return this.http.get<Event[][]>(url).pipe(
      map(ancestors => ancestors.flatMap(a => a )),
      map(this.flattenReferences))
  }

  flattenReferences<T>(response: T): T {
    const deserializer = new JSOGDeserializer();
    const resolvedResponse = deserializer.deserialize<T>(response as JSOGObject);
    return resolvedResponse as T;
  }

}
