import {computed, effect, Injectable, linkedSignal} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {catchError, forkJoin, map, Observable, of} from "rxjs";
import {rxResource} from "@angular/core/rxjs-interop";
import {UrlStateService} from "./url-state.service";
import {CONTENT_SERVICE} from "../../environments/environment";
import {JSOGDeserializer, JSOGObject} from "../utils/JSOGDeserializer";
import {DatabaseObject} from "../model/graph/database-object.model";
import {Pathway} from "../model/graph/event/pathway.model";
import {SelectableObject} from "./event.service";
import {isPathway, isReferenceEntityStId} from "./utils";
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

type FlaggingResult = {
  matches: string[],
  interactsWith: string[]
};

@Injectable({
  providedIn: 'root'
})
export class DataStateService {
  _currentPathway = rxResource({
    request: () => this.state.pathwayId(),
    loader: (params) => this.fetchEnhancedData<Pathway>(params.request, {
      summariseReferenceEntity: false,
      fetchIncomingRelationships: true, // needed for compare mode
      includeDisease: true
    })
  })

  public currentPathway = computed(() => {
    const currentPathway = this._currentPathway.value();
    if (currentPathway) {
      currentPathway.ancestors = this._ancestors.value() || [];
    }
    return currentPathway;
  })

  private _ancestors = rxResource({
    request: () => ({id: this.state.pathwayId(), path: this.state.path()}),
    loader: (params) => this.fetchAncestors(params.request.id, params.request.path)
  })

  private _selectedElement = rxResource({
    request: () => ({
      id: this.state.select() || this.state.pathwayId(),
      summariseDisease: this.state.summariseDisease()
    }),
    loader: (params) => !params.request.id ? of() : this.fetchEnhancedData<SelectableObject>(params.request.id, {includeDisease: params.request.summariseDisease === true})
  })

  public selectedElement = this._selectedElement.asReadonly().value
  public selectedElementLoading = this._selectedElement.asReadonly().isLoading

  hasDetail = computed(() => !!(this.state.select() || this.state.pathwayId()));
  selectIsSummary = computed(() => isReferenceEntityStId(this.state.select()))

  private _selectionData = computed<SelectionData>(() => ({
    selectedElement: this.selectedElement(),
    selectedElementLoading: this.selectedElementLoading(),
    currentPathway: this.state.pathwayId()
  }))

  selectedPathwayStId = linkedSignal<SelectionData, string | undefined>({
    source: this._selectionData,
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
    loader: ({request: {diagram, tokens, species}}) => tokens.length === 0 ?
      of({matches: [], interactsWith: []}) // No tokens
      : forkJoin(tokens.map(query => { // Combine tokens
        return diagram// When in diagram / ehld view // When in reacfoam view
          ? this.getDiagramFlagging(diagram, query)
          : this.getReacfoamFlagging(query, species!)
      })).pipe(
        map(results => results.reduce<FlaggingResult>(
            (acc, result) => {
              if (result.matches) acc.matches.push(...result.matches);
              if (result.interactsWith) acc.interactsWith!.push(...result.interactsWith);
              return acc;
            },
            {matches: [], interactsWith: []}
          )
        )
      )
  })

  getReacfoamFlagging(query: string, species: string): Observable<Partial<FlaggingResult>> {
    return this.http.get<FireworksFlagResult>(`${CONTENT_SERVICE}/search/fireworks/flag`, {
      params: {query, species, scope: 'REFERENCE_ENTITY', includeInteractors: false},
    }).pipe(
      catchError(() => of({} as FireworksFlagResult)),
      map(r => ({
        matches: r.llps,
        interactsWith: r.interactsWith
      }))
    );
  }

  getDiagramFlagging(diagram: string, query: string): Observable<Partial<FlaggingResult>> {
    return this.http.get<DiagramFlagResult>(`${CONTENT_SERVICE}/search/diagram/${diagram}/flag`, {
      params: {query, scope: 'REFERENCE_ENTITY', includeInteractors: false}
    }).pipe(
      catchError(() => of({} as DiagramFlagResult)),
      map(r => ({
        matches: r.occurrences,
        interactsWith: r.interactsWith
      }))
    );
  }

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

  fetchEnhancedData<T extends DatabaseObject>(id: string | number | null, params?: Partial<{
    fetchIncomingRelationships: boolean,
    summariseReferenceEntity: boolean,
    includeDisease: boolean
  }>): Observable<T | undefined> {
    let url = `${CONTENT_SERVICE}/data/query/enhanced/v2/${id}`;
    if (id === null) return of();
    if (!isReferenceEntityStId(id.toString()) && params) params.includeDisease = true; // Always include disease data for non summary elements

    return this.http.get<T>(url, {
      params: {
        fetchIncomingRelationships: true,
        summariseReferenceEntity: true,
        includeDisease: true,
        ...params,
        includeRef: true,
        view: 'nested-aggregated'
      }
    }).pipe(map(this.flattenReferences))
  }

  fetchAncestors(stId: string | undefined, path: string[]): Observable<Pathway[]> {
    let url = `${CONTENT_SERVICE}/data/event/${stId}/ancestors`;
    if (stId === undefined) return of();
    return this.http.get<Pathway[][]>(url, {
      params: {
        includeRef: true,
        view: 'nested-aggregated'
      }
    }).pipe(
      map(lineages => this.findBestAncestors(lineages, path).reverse()),
      map(this.flattenReferences))
  }

  flattenReferences<T>(response: T): T {
    const deserializer = new JSOGDeserializer();
    const resolvedResponse = deserializer.deserialize<T>(response as JSOGObject);
    return resolvedResponse as T;
  }

  private findBestAncestors(lineages: Pathway[][], path: string[]): Pathway[] {
    if (!lineages) return [];
    if (lineages.length === 1) return lineages[0];

    const idealIds = new Set(path);
    let bestAncestors: Pathway[] = lineages[0];
    let bestAncestorsScore = this.getAncestorsMatchingScore(lineages[0], idealIds);
    for (const ancestors of lineages.slice(1)) {
      const score = this.getAncestorsMatchingScore(ancestors, idealIds);
      if (score > bestAncestorsScore) {
        bestAncestors = ancestors;
        bestAncestorsScore = score;
      }
    }
    return bestAncestors;
  }

  private getAncestorsMatchingScore(ancestors: Pathway[], path: Set<string>) {
    return ancestors.reduce((score, ancestor) => path.has(ancestor.stId) ? score + 1 : score,0)
  }


}
