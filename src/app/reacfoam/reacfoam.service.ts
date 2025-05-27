import {computed, Injectable, Signal} from '@angular/core';
import {SpeciesService} from "../services/species.service";
import {environment} from "../../environments/environment";
import {map, Observable} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {Species} from "../model/graph/species.model";
import {UrlStateService} from "../services/url-state.service";
import {InteractorService} from "../interactors/services/interactor.service";
import {DataObject, Position} from "@carrotsearch/foamtree";
import {rxResource} from "@angular/core/rxjs-interop";
import chroma from "chroma-js";
import {AnalysisService} from "../services/analysis.service";

const LAYOUT_URL = "assets/reacfoam/layout.tsv";
export namespace EventsHierarchy {
  export interface Data {
    diagram: boolean
    name: string
    stId: string
    type: 'TopLevelPathway' | 'Pathway' | 'CellLineagePath'
    species: string,
    children: Data[]
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

export interface PathwayGroup extends DataObject {
  id: string,
  disease: boolean,
  diagram: boolean,
  groups?: PathwayGroup[],
  initialPosition?: Position
  label: string,
  stId: string,
  weight: number,
  family: string,
  color: string
  flag?: boolean
}

@Injectable({
  providedIn: 'root'
})
export class ReacfoamService {

  constructor(
    private http: HttpClient,
    private species: SpeciesService,
    private state: UrlStateService,
    private interactors: InteractorService,
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
    if (!this.layoutMap.value()) return new Map<string, chroma.Color>()
    const layoutMap = this.layoutMap.value()!;
    const familyColorMap = new Map([...layoutMap.values()].map(tlp => [tlp.family, chroma('blue')]))
    const dH = 360 / familyColorMap.size + 1;
    const offset = 0;

    [...familyColorMap.keys()].forEach((family, i) => {
      const color = chroma.oklch(0.98, 0.05, (offset + dH * i) % 360);
      familyColorMap.set(family, color);
    })

    return familyColorMap
  })

  data: Signal<PathwayGroup[] | undefined> = computed(() => {
      if (!this.mergedData()) return;
      console.log('data making')
      const {layoutMap, fireworksNodeMap, events} = this.mergedData()!
      return events.map(e => this.event2group(e, layoutMap, fireworksNodeMap, chroma('#ffffff')))
    }
  )

  event2group(event: EventsHierarchy.Data, layoutMap: Map<string, Layout.Data>, fireworksNodeMap: Map<string, Fireworks.Node>, color?: chroma.Color, parentFamily?: string): PathwayGroup {
    const fireworksNode = fireworksNodeMap.get(event.stId);
    const layoutNode = layoutMap.get(event.stId);
    const family = parentFamily || layoutNode!.family;
    const currentColor = color || this.familyColorMap().get(family)!;
    const childColor = currentColor.hex() === '#ffffff' ? chroma('#e4ebf3') : currentColor.darken(0.2).saturate(0.2);

    return {
      groups: event.children ? event.children.map(c => this.event2group(c, layoutMap, fireworksNodeMap, childColor, family)) : undefined,
      id: event.stId,
      stId: event.stId,
      label: event.name,
      diagram: event.diagram,
      disease: fireworksNode?.disease || false,
      weight: fireworksNode && fireworksNode.ratio !== 0 ? fireworksNode.ratio * 1000 : 9,
      initialPosition: layoutNode,
      color: currentColor.hex(),
      family,
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
