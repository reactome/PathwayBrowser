import {computed, Injectable, Signal} from '@angular/core';
import {SpeciesService} from "../services/species.service";
import {environment} from "../../environments/environment";
import {map, Observable} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {Species} from "../model/graph/species.model";
import {UrlStateService} from "../services/url-state.service";
import {FoamTree} from "@carrotsearch/foamtree";
import {rxResource} from "@angular/core/rxjs-interop";
import chroma from "chroma-js";
import {AnalysisService} from "../services/analysis.service";
import {DarkService} from "../services/dark.service";
import {Analysis} from "../model/analysis.model";
import {extract, Style} from "reactome-cytoscape-style";
import {isArray} from "lodash";

const LAYOUT_URL = "assets/reacfoam/layout.tsv";
export namespace EventsHierarchy {
  export interface Data {
    diagram: boolean
    name: string
    stId: string
    type: 'TopLevelPathway' | 'Pathway' | 'CellLineagePath'
    species: string,
    llp?: boolean,
    totalEntity: number,
    totalEntityAndInteractors: number,
    children: Data[]
    reactions?: Analysis.Pathway['reactions']
    entities?: Analysis.Pathway['entities']
  }

  export interface QueryParams {
    pathwaysOnly: boolean,
    token: string,
    resource: string,
    interactors: boolean,
    importableOnly: boolean,
    view: 'flatten' | 'nested' | 'nested-aggregated',
  }
}

export namespace Fireworks {
  export interface Node {
    dbId: number,
    stId: string,
    disease: boolean,
    name: string,
    ratio: number,
    x: number,
    y: number
  }

  export interface Edge {
    from: number,
    to: number
  }

  export interface Data {
    speciesId: number,
    speciesName: string,
    edges: Edge[]
    nodes: Node[]
  }
}

export namespace Layout {
  export interface Data {
    stId: string,
    name: string,
    distanceFromCenter: number,
    position: number,
    family: string
  }
}

export interface PathwayGroup extends FoamTree.DataObject {
  id: string,
  disease: boolean,
  diagram: boolean,
  groups?: PathwayGroup[],
  initialPosition?: FoamTree.Position
  label: string,
  stId: string,
  weight: number,
  family: string,
  llp: boolean,
  familyColor: chroma.Color
  depth: number
  flag?: boolean
  expressions?: number[]
  fdr?: number
  pValue?: number
  path: string[]
}

@Injectable({
  providedIn: 'root'
})
export class ReacfoamService {

  style: Style = new Style(document.body);

  constructor(
    private http: HttpClient,
    private species: SpeciesService,
    private state: UrlStateService,
    private dark: DarkService,
    private analysis: AnalysisService
  ) {
  }

  speciesName = computed(() => this.species.currentSpecies().displayName.replaceAll(" ", "_"))

  fetchEventsHierarchy(species: Species, params: Partial<EventsHierarchy.QueryParams>): Observable<EventsHierarchy.Data[]> {
    cleanObject(params)
    console.log('fetch events hierarchy')
    return this.http.get<EventsHierarchy.Data[]>(`${environment.host}/ContentService/data/eventsHierarchy/${species.taxId}`, {params})
  }


  fetchTLPLayoutMap(): Observable<Map<string, Layout.Data>> {
    console.log('fetch tlp layout')
    return this.http.get(LAYOUT_URL, {responseType: "text"}).pipe(
      map((text) => new Map(
          text.split("\n") // Split lines
            .filter(line => !line.startsWith("#")) // Remove comments lines
            .filter(line => line.length > 0) // Remove empty lines
            .map(line => line.split("\t")) // Split columns
            .map(([stId, name, distance, angle, family]) => [stId, {
              stId,
              name,
              distanceFromCenter: parseFloat(distance),
              position: 360 - parseFloat(angle), // Invert angle as GeoGebra and foamtree angle go in oposite direction
              family
            }])
        )
      )
    )
  }


  layoutMap = rxResource({
    request: () => true,
    loader: () => this.fetchTLPLayoutMap()
  })

  eventsHierarchyData = rxResource({
    request: () => ({
      species: this.species.currentSpecies(),
      params: {
        pathwaysOnly: true,
        token: this.state.analysis() || undefined,
        resource: this.analysis.resourceFilter(),
        interactors: this.analysis.result()?.summary?.interactors,
        view: 'nested-aggregated',
      } as EventsHierarchy.QueryParams
    }),
    loader: ({request}) => this.fetchEventsHierarchy(request.species, request.params)
  })

  mergedData = computed(() => {
    return this.layoutMap.value() && this.eventsHierarchyData.value() ? {
      layoutMap: this.layoutMap.value()!,
      events: this.eventsHierarchyData.value()!,
    } : undefined
  })

  familyColorMap = computed(() => {
    console.log('signal familyColorMap')
    this.dark.isDark(); // Compute on dark update
    if (!this.layoutMap.value()) return new Map<string, chroma.Color>()
    const layoutMap = this.layoutMap.value()!;
    const familyColorMap = new Map([...layoutMap.values()].map(tlp => [tlp.family, chroma('blue')]))
    const dH = 360 / familyColorMap.size + 1;
    const offset = 0;

    [...familyColorMap.keys()].forEach((family, i) => {
      const color = this.dark.isDark() ?
        chroma.oklch(0.01, 0.03, (offset + dH * i) % 360) :
        chroma.oklch(0.98, 0.05, (offset + dH * i) % 360);
      familyColorMap.set(family, color);
    })

    return familyColorMap
  })

  flagColor = computed(() => {
    this.dark.isDark(); // Compute on dark update
    return chroma(extract(this.style.properties.global.flag))
  })

  surfaceColor = computed(() => {
    this.dark.isDark(); // Compute on dark update
    return chroma(extract(this.style.properties.global.surface))
  })

  onSurfaceColor = computed(() => {
    this.dark.isDark(); // Compute on dark update
    return chroma(extract(this.style.properties.global.onSurface))
  })

  mergedFilters = computed(() => ({
    excludeGrouping: this.state.includeGrouping() === false,
    excludeDiseases: this.state.includeDisease() === false,
    minSize: this.state.pathwayMinSizeFilter(),
    maxSize: this.state.pathwayMaxSizeFilter(),
    minExpression: this.state.minExpressionFilter(),
    maxExpression: this.state.maxExpressionFilter(),
    fdr: this.state.fdrFilter(),
    gsa: new Set(this.state.gsaFilter()),
  }))

  // Avoid triggering data update if lockView is enabled by firing same default object
  filters = computed(() => this.state.filterViewMode() === 'overview' ? {
    excludeGrouping: undefined,
    excludeDiseases: undefined,
    minSize: undefined,
    maxSize: undefined,
    minExpression: undefined,
    maxExpression: undefined,
    fdr: undefined,
    gsa: undefined,
  } : this.mergedFilters())

  dataAndIdResolver: Signal<{ data: PathwayGroup[], idResolver: Map<string, string> } | undefined> = computed(() => {
    this.dark.isDark();  // Compute on dark update
    this.filters(); // Compute on filters update
    if (!this.mergedData()) return;
    const {layoutMap, events} = this.mergedData()!
    const stIdToFirstId = new Map<string, string>();
    return {
      data: events.map(e => this.event2group(e, layoutMap, stIdToFirstId)).flatMap(g => g),
      idResolver: stIdToFirstId
    }
  })

  data = computed(() => this.dataAndIdResolver()?.data)
  idToStId = computed(() => this.dataAndIdResolver()?.idResolver)

  event2group(event: EventsHierarchy.Data, layoutMap: Map<string, Layout.Data>, stIdToFirstId: Map<string, string>, parentFamily?: string, depth = 0, path: string[] = []): PathwayGroup[] {
    const humanStId = event.stId.replace(this.species.currentSpecies().abbreviation, 'HSA');
    const layoutNode = layoutMap.get(humanStId) || layoutMap.get(event.stId);

    const family = parentFamily || layoutNode?.family || 'Unknown family'; // Unknown family with M. tuberculosis
    const familyColor = this.familyColorMap().get(family) || this.surfaceColor(); // Unknown family with M. tuberculosis

    const id = this.buildId(event.stId, path)!; // If no path or wrong path given, will use first occurrence of stId
    if (!stIdToFirstId.has(event.stId)) stIdToFirstId.set(event.stId, id);

    const isDisease = [path[0], event.stId].includes('R-HSA-1643685');

    const children = event.children ? event.children.map(c => this.event2group(c, layoutMap, stIdToFirstId, family, depth + 1, [...path, event.stId])).flatMap(g => g) : [];
    if (this.analysis.result() && this.state.filterViewMode() !== 'overview') { // Apply filters only if we have an analysis
      if (this.filters().excludeDiseases && isDisease) return [];
      if (this.filters().excludeGrouping && !event.llp) return children;
      if (children.length === 0) { // if no children because of filters or simple leaf, then apply filters
        if (this.filters().fdr !== undefined && (event.entities?.fdr || 1) > this.mergedFilters().fdr!) return [];
        if (this.filters().minSize !== undefined && (event.entities?.total || Number.MIN_VALUE) < this.mergedFilters().minSize!) return [];
        if (this.filters().maxSize !== undefined && (event.entities?.total || Number.MAX_VALUE) > this.mergedFilters().maxSize!) return [];
        if (this.filters().minExpression !== undefined && (event.entities?.exp[this.analysis.sampleIndex()] || Number.MIN_VALUE) < this.mergedFilters().minExpression!) return [];
        if (this.filters().maxExpression !== undefined && (event.entities?.exp[this.analysis.sampleIndex()] || Number.MAX_VALUE) > this.mergedFilters().maxExpression!) return [];
        if (this.filters().maxExpression !== undefined && (event.entities?.exp[this.analysis.sampleIndex()] || Number.MAX_VALUE) > this.mergedFilters().maxExpression!) return [];
        if (this.filters().gsa?.size !== 0 && !this.filters().gsa?.has(event.entities?.exp[this.analysis.sampleIndex()] || 0)) return [];
      }
    }


    const pathwayGroup: PathwayGroup = {
      groups: children,
      id: id,
      stId: event.stId,
      label: event.name,
      diagram: event.diagram,
      disease: isDisease,
      weight: event.totalEntity,
      initialPosition: layoutNode,
      familyColor: familyColor,
      family,
      depth,
      path,
      expressions: event.entities?.exp,
      fdr: event.entities?.fdr,
      pValue: event.entities?.pValue,
      llp: event?.llp || false

      // exposed: untracked(this.state.select) === event.stId // Untracked to avoid full reloading if select is updated
    };
    return [pathwayGroup]
  }

  buildId(stId: string | null, path: string[]): string | null {
    return stId ? path.join('/') + '/' + stId : null;
  }
}

export function cleanObject<O extends Object>(object: O): O {
  for (const key in object) {
    if (object[key] === null || object[key] === undefined || (isArray(object[key]) && object[key].length === 0)) {
      delete object[key];
    }
  }
  return object;
}
