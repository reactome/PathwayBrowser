import {computed, effect, Injectable, linkedSignal} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {catchError, forkJoin, map, Observable, of, tap} from "rxjs";
import {rxResource} from "@angular/core/rxjs-interop";
import {UrlStateService} from "./url-state.service";
import {environment} from "../../environments/environment";
import {JSOGDeserializer, JSOGObject} from "../utils/JSOGDeserializer";
import {DatabaseObject} from "../model/graph/database-object.model";
import {Pathway} from "../model/graph/event/pathway.model";
import {SelectableObject} from "./event.service";
import {isPathway} from "./utils";
import {SpeciesService} from "./species.service";

type SelectionData = {
  selectedElement: SelectableObject | undefined,
  selectedElementLoading: boolean,
  currentPathway: string | undefined
}

type DiagramFlagResult = {
  diagramEntity?: string,
  inDiagram?: boolean,
  occurrences?: string[],
  interactsWith?: string[]
};

type FireworksFlagResult = {
  llps?: string[],
  interactsWith?: string[]
};

@Injectable({
  providedIn: 'root'
})
export class DataStateService {
  _currentPathway = rxResource({
    request: () => this.state.pathwayId(),
    loader: (params) => this.fetchEnhancedData<Pathway>(params.request)
  })

  public currentPathway = computed(() => {
    const currentPathway = this._currentPathway.value();
    if (currentPathway) {
      currentPathway.ancestors = this._ancestors.value() || [];
    }
    return currentPathway;
  })

  private _ancestors = rxResource({
    request: () => this.state.pathwayId(),
    loader: (params) => this.fetchAncestors(params.request)
  })

  private _selectedElement = rxResource({
    request: () => this.state.select() || this.state.pathwayId(),
    loader: (params) => this.fetchEnhancedData<SelectableObject>(params.request)
  })

  public selectedElement = this._selectedElement.asReadonly().value
  public selectedElementLoading = this._selectedElement.asReadonly().isLoading

  selectionData = computed<SelectionData>(() => ({
    selectedElement: this.selectedElement(),
    selectedElementLoading: this.selectedElementLoading(),
    currentPathway: this.state.pathwayId()
  }))

  selectedPathwayStId = linkedSignal<SelectionData, string | undefined>({
    source: this.selectionData,
    computation: (source: SelectionData, previous?: { source: SelectionData, value: string | undefined }) => {
      if (source.selectedElementLoading && previous) return previous.value;
      if (source.selectedElement && isPathway(source.selectedElement)) return source.selectedElement.stId
      return source.currentPathway
    }
  })

  flagRequest = computed(() => {
    const params = ({
      tokens: this.state.flag()
        .filter(token => !token.startsWith("class:")),
      diagram: this.state.pathwayId(),
      species: this.species.currentSpecies().displayName,
    })
    console.log('updating request', params);
    return params;
  })

  flagResource = rxResource({
    request: this.flagRequest,
    loader: ({request: {diagram, tokens, species}}) => forkJoin(tokens.map(query => {
      return diagram// When in diagram / ehld view // When in reacfoam view
        ? this.http.get<DiagramFlagResult>(`${environment.host}/ContentService/search/diagram/${diagram}/flag`, {params: {query}}).pipe(
          catchError(() => of({} as DiagramFlagResult)),
          map(r => ({
            matches: r.occurrences,
            interactsWith: r.interactsWith
          }))
        )
        : this.http.get<FireworksFlagResult>(`${environment.host}/ContentService/search/fireworks/flag`, {
          params: {
            query,
            species
          }
        }).pipe(
          catchError(() => of({} as FireworksFlagResult)),
          map(r => ({
            matches: r.llps,
            interactsWith: r.interactsWith
          }))
        )
    })).pipe(
      map(results => results.reduce<{
        matches: string[],
        interactsWith: string[]
      }>(
        (acc, result) => {
          if (result.matches) acc.matches.push(...result.matches);
          if (result.interactsWith) acc.interactsWith!.push(...result.interactsWith);
          return acc;
        },
        {matches: [], interactsWith: []})
      )
    )
  })

  flagIdentifiers = computed(() => {
    const identifiers: string[] = this.state.flag().filter(token => token.startsWith("class:"));
    const match = this.flagResource.value();
    if (match?.matches) identifiers.push(...match.matches);
    if (this.state.flagInteractors() && match?.interactsWith) identifiers.push(...match.interactsWith);
    return identifiers;
  })


  constructor(private state: UrlStateService, private http: HttpClient, private species: SpeciesService) {
    effect(() => console.log('Flagging', this.flagIdentifiers()));
    effect(() => console.log('Flagging error', this.flagResource.error()));
    effect(() => {
      if (this._selectedElement.error()) this.state.select.set(null); // If selection doesn't exist (wrong id), we remove selection
    });
  }

  fetchEnhancedData<T extends DatabaseObject>(id: string | number | null): Observable<T | undefined> {
    let url = `${environment.host}/ContentService/data/query/enhanced/${id}?includeRef=true&view=nested-aggregated`;
    if (id === null) return of();
    return this.http.get<T>(url).pipe(map(this.flattenReferences))
  }

  fetchAncestors(stId: string | null): Observable<Pathway[]> {
    let url = `${environment.host}/ContentService/data/event/${stId}/ancestors?includeRef=true&view=nested-aggregated`;
    if (stId === null) return of();
    return this.http.get<Pathway[][]>(url).pipe(
      map(ancestors => ancestors.flatMap(a => a.reverse())),
      map(this.flattenReferences))
  }

  flattenReferences<T>(response: T): T {
    const deserializer = new JSOGDeserializer();
    const resolvedResponse = deserializer.deserialize<T>(response as JSOGObject);
    return resolvedResponse as T;
  }

}
