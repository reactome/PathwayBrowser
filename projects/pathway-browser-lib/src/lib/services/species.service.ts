import {computed, effect, Injectable, signal} from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {catchError, map, Observable, of} from "rxjs";
import {OrthologousMap, Species} from "../model/graph/species.model";
import {PathwayBrowserConfigService} from "./pathway-browser-config.service";
import {Event} from "../model/graph/event/event.model";
import {ActivatedRoute, Router} from "@angular/router";
import {UrlStateService} from "./url-state.service";
import {rxResource} from "@angular/core/rxjs-interop";
import {isDefined} from "./utils";
import {SelectableObject} from "./event.service";

@Injectable({
  providedIn: 'root'
})
export class SpeciesService {

  private _MAIN_SPECIES!: string;
  private _ORTHOLOGIES!: string;

  defaultSpecies: Species = {
    displayName: 'Homo sapiens',
    taxId: '9606',
    dbId: 48887,
    shortName: 'H. sapiens',
    abbreviation: 'HSA',
    schemaClass: 'Species'
  };

  currentSpecies = signal<Species>(this.defaultSpecies)


  private allSpecies = rxResource({
      request: () => null,
      loader: () => this.http.get<Species[]>(this._MAIN_SPECIES)
    }
  )

  allShortenSpecies = computed(() => this.allSpecies.value()
    ?.map(this.setShortName)
    .sort((s1, s2) => s1.displayName.localeCompare(s2.shortName))
  )

  // TODO use this but with a good backend endpoint to have the avilable alternative species for any given pathway
  // availableSpecies = computed(() => {
  //   const speciesList = this.allShortenSpecies();
  //   const currentPathway = this.dataState.currentPathway.value();
  //   if (!currentPathway) return speciesList;
  //   const orthologs = new Set(currentPathway.orthologousEvent?.map(ortholog => ortholog.speciesName!) || []);
  //   return speciesList?.filter((specie: Species) => orthologs.has(specie.displayName)) || []
  // })

  abbreviationToSpecies = computed(() => new Map(this.allShortenSpecies()?.map(s => ([s.abbreviation, s]))))

  constructor(private http: HttpClient, private state: UrlStateService, private router: Router, private route: ActivatedRoute, private config: PathwayBrowserConfigService) {
    this._MAIN_SPECIES = `${this.config.CONTENT_SERVICE}/data/species/main`;
    this._ORTHOLOGIES = `${this.config.CONTENT_SERVICE}/data/orthologies/ids/species/`;
    effect(() => {
      const newSpecies = this.abbreviationToSpecies().get(this.state.pathwayId()?.substring(2, 5) || '');
      if (newSpecies) this.currentSpecies.set(newSpecies);
    });
  }

  getClosestOrthologPathwayWithSelect(select: string | null, ancestors: Event[], newSpecies: Species): Observable<{
    pathway: string | undefined,
    map: OrthologousMap,
  }> {
    return this.getOrthologousMap(
      [select, ...ancestors.map((a) => a.stId)].filter(isDefined),
      newSpecies.dbId)
      .pipe(map(orthologousMap => {
          for (const ancestor of ancestors.reverse()) { // Start from the end of ancestry, and gradually go up if there is no equivalent pathway
            if (orthologousMap.get(ancestor.stId)) {
              return {
                pathway: orthologousMap.get(ancestor.stId),
                map: orthologousMap
              };
            }
          }
          return {
            pathway: undefined,
            map: orthologousMap
          };
        })
      )
  }

  private getOrthologousMap(identifiers: string[], speciesDbId: number): Observable<OrthologousMap> {
    if (identifiers.length === 0) return of(new Map());
    const url = `${this._ORTHOLOGIES}${speciesDbId}`;
    return this.http.post<{ [p: string]: SelectableObject }>(
      url,
      identifiers.filter(i => !i.startsWith("R-ALL")).join(','),
      {headers: new HttpHeaders({'Content-Type': 'text/plain'})}
    ).pipe(
      map(mapping => new Map(identifiers.map(i => ([i, i.startsWith('R-ALL') ? i : mapping[i]?.stId])))),
      catchError(e => of(new Map(identifiers.map(i => ([i, undefined]))))
      )
    );
  }

  getOrtholog(identifier: string | number | null, speciesDbID: number): Observable<Event | null> {
    if (!identifier) return of(null);
    return this.http.get<Event>(`${this.config.CONTENT_SERVICE}/data/orthology/${identifier}/species/${speciesDbID}`);
  }


  private setShortName(s: Species): Species {
    const [genus, species, ..._] = s.displayName.split(' ');
    return {...s, shortName: `${genus.charAt(0)}. ${species}`};
  }

  updateQueryParams(map: OrthologousMap, pathwayId: string | undefined) {
    const params = {...this.route.snapshot.queryParams};
    for (const [key, value] of Object.entries(params)) {
      let newValue = JSON.stringify(value);
      for (let [initial, replacement] of map) {
        newValue = newValue.replaceAll(initial, replacement || '');
      }
      newValue = newValue.replaceAll(',""', '').replaceAll('""', '').trim() // Remove trailing commas and quotes from lists
      console.log(value, " => ", newValue);
      if (newValue.length === 0) delete params[key];
      else params[key] = JSON.parse(newValue);
    }

    this.router.navigate(pathwayId ? [pathwayId] : ['.'], {
      relativeTo: this.getDeepestRoute(),
      queryParams: params,
      preserveFragment: true
    });
  }

  /**
   * Gets the deepest activated route for relative navigation.
   */
  private getDeepestRoute(): ActivatedRoute {
    let route = this.router.routerState.root;
    while (route.firstChild) {
      route = route.firstChild;
    }
    return route;
  }

}
