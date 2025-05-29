import {computed, Injectable, Signal, untracked} from '@angular/core';
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

const LAYOUT_URL = "assets/reacfoam/layout.tsv";
export namespace EventsHierarchy {
  export interface Data {
    diagram: boolean
    name: string
    stId: string
    type: 'TopLevelPathway' | 'Pathway' | 'CellLineagePath'
    species: string,
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
  familyColor: chroma.Color
  depthColor: chroma.Color
  depth: number
  flag?: boolean
  expressions?: number[]
  fdr?: number
  pValue?: number
}

export const LIGHT_SURFACE_COLOR = '#effbff';
export const DARK_SURFACE_COLOR = '#00161b';

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
    return this.http.get<EventsHierarchy.Data[]>(`${environment.host}/ContentService/data/eventsHierarchy/${species.taxId}`, {params})
  }

  fetchFireworksNodeMap(species: string): Observable<Map<string, Fireworks.Node>> {
    return this.http.get<Fireworks.Data>(`${environment.host}/download/current/fireworks/${species}.json`).pipe(
      map(data => new Map(data.nodes.map(node => [node.stId, node])))
    )
  }

  fetchTLPLayoutMap(): Observable<Map<string, Layout.Data>> {
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

  fireworksNodeMap = rxResource({
    request: () => ({species: this.speciesName()}),
    loader: ({request}) => this.fetchFireworksNodeMap(request.species)
  })

  eventsHierarchyData = rxResource({
    request: () => ({
      species: this.species.currentSpecies(),
      params: {
        pathwaysOnly: true,
        token: this.state.analysis() || undefined,
        resource: this.analysis.resourceFilter(),
        interactors: this.analysis.resultSignal()?.summary?.interactors,
        view: 'nested-aggregated',
      } as EventsHierarchy.QueryParams
    }),
    loader: ({request}) => this.fetchEventsHierarchy(request.species, request.params)
  })

  mergedData = computed(() => this.layoutMap.value() && this.fireworksNodeMap.value() && this.eventsHierarchyData.value() ? {
    layoutMap: this.layoutMap.value()!,
    fireworksNodeMap: this.fireworksNodeMap.value()!,
    events: this.eventsHierarchyData.value()!,
  } : undefined)

  familyColorMap = computed(() => {
    this.dark.isDark(); // Compute on dark update
    if (!this.layoutMap.value()) return new Map<string, chroma.Color>()
    const layoutMap = this.layoutMap.value()!;
    const familyColorMap = new Map([...layoutMap.values()].map(tlp => [tlp.family, chroma('blue')]))
    const dH = 360 / familyColorMap.size + 1;
    const offset = 0;

    [...familyColorMap.keys()].forEach((family, i) => {
      const color = this.dark.isDark() ?
        chroma.oklch(0.02, 0.05, (offset + dH * i) % 360) :
        chroma.oklch(0.98, 0.05, (offset + dH * i) % 360);
      familyColorMap.set(family, color);
    })

    return familyColorMap
  })

  surfaceColor = computed(() => {
    this.dark.isDark(); // Compute on dark update
    return chroma(extract(this.style.properties.global.surface))
  } )

  data: Signal<PathwayGroup[] | undefined> = computed(() => {
      this.dark.isDark();  // Compute on dark update
      if (!this.mergedData()) return;
      const {layoutMap, fireworksNodeMap, events} = this.mergedData()!
      return events.map(e => this.event2group(e, layoutMap, fireworksNodeMap))
    }
  )

  event2group(event: EventsHierarchy.Data, layoutMap: Map<string, Layout.Data>, fireworksNodeMap: Map<string, Fireworks.Node>, parentFamily?: string, parentColor?: chroma.Color, depth = 0): PathwayGroup {
    const humanStId = event.stId.replace(this.species.currentSpecies().abbreviation, 'HSA');
    const fireworksNode = fireworksNodeMap.get(event.stId);
    const layoutNode = layoutMap.get(humanStId) || layoutMap.get(event.stId);

    const family = parentFamily || layoutNode?.family || 'Unknown family'; // Unknown family with M. tuberculosis
    const familyColor = this.familyColorMap().get(family) || this.surfaceColor(); // Unknown family with M. tuberculosis

    const depthColor = this.dark.isDark() ?
      parentColor ? parentColor.brighten(0.2).saturate(0.2) : this.surfaceColor() :
      parentColor ? parentColor.darken(0.2).saturate(0.2) : this.surfaceColor();

    return {
      groups: event.children ? event.children.map(c => this.event2group(c, layoutMap, fireworksNodeMap, family, depthColor, depth + 1)) : undefined,
      id: event.stId,
      stId: event.stId,
      label: event.name,
      diagram: event.diagram,
      disease: fireworksNode?.disease || false,
      weight: fireworksNode && fireworksNode.ratio !== 0 ? fireworksNode.ratio * 1000 : 9,
      initialPosition: layoutNode,
      familyColor: familyColor,
      depthColor: depthColor,
      family,
      depth,
      expressions: event.entities?.exp,
      fdr: event.entities?.fdr,
      pValue: event.entities?.pValue,
      selected: untracked(this.state.select) === event.stId // Untracked to avoid full reloading if select is updated
    }
  }
}

function cleanObject<O extends Object>(object: O): O {
  for (const key in object) {
    if (object[key] === null || object[key] === undefined) {
      delete object[key];
    }
  }
  return object;
}
