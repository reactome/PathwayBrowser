import {computed, effect, Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Event} from "../model/graph/event/event.model";
import {map, Observable, of} from "rxjs";
import {rxResource} from "@angular/core/rxjs-interop";
import {UrlStateService} from "./url-state.service";
import {environment} from "../../environments/environment";
import {JSOGDeserializer, JSOGObject} from "../utils/JSOGDeserializer";
import {DatabaseObject} from "../model/graph/database-object.model";
import {Pathway} from "../model/graph/event/pathway.model";
import {SelectableObject} from "./event.service";

@Injectable({
  providedIn: 'root'
})
export class DataStateService {
  private _currentPathway = rxResource({
    request: () => this.state.pathwayId(),
    loader: (params) => this.fetchEnhancedData<Pathway>(params.request)
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
    request: () => this.state.select() || this.state.pathwayId(),
    loader: (params) => this.fetchEnhancedData<SelectableObject>(params.request)
  })

  public selectedElement = this._selectedElement.asReadonly().value


  constructor(private state: UrlStateService, private http: HttpClient) {
    effect(() => {
      if (this._selectedElement.error()) this.state.select.set(null); // If selection doesn't exist (wrong id), we remove selection
    });
  }

  fetchEnhancedData<T extends DatabaseObject>(stId: string | null): Observable<T | undefined> {
    let url = `${environment.host}/ContentService/data/query/enhanced/${stId}?includeRef=true`;
    if (stId === null) return of();
    return this.http.get<T>(url).pipe(map(this.flattenReferences))
  }

  fetchAncestors(stId: string | null): Observable<Pathway[]> {
    let url = `${environment.host}/ContentService/data/event/${stId}/ancestors?includeRef=true`;
    if (stId === null) return of();
    return this.http.get<Pathway[][]>(url).pipe(
      map(ancestors => ancestors.flatMap(a => a )),
      map(this.flattenReferences))
  }

  flattenReferences<T>(response: T): T {
    const deserializer = new JSOGDeserializer();
    const resolvedResponse = deserializer.deserialize<T>(response as JSOGObject);
    return resolvedResponse as T;
  }

}
