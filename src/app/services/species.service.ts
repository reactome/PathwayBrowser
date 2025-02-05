import {computed, effect, Injectable, signal} from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {catchError, map, Observable, of} from "rxjs";
import {environment} from "../../environments/environment";
import {OrthologousMap, Species} from "../model/species.model";
import {Event} from "../model/graph/event.model";
import {DiagramStateService} from "./diagram-state.service";
import {ActivatedRoute} from "@angular/router";
import {UrlParam, UrlStateService} from "./url-state.service";
import {rxResource} from "@angular/core/rxjs-interop";
import {isDefined} from "./utils";
import {ActivatedRoute, Router} from "@angular/router";

@Injectable({
  providedIn: 'root'
})
export class SpeciesService {

  private readonly _MAIN_SPECIES = `${environment.host}/ContentService/data/species/main`;
  private readonly _ORTHOLOGIES = `${environment.host}/ContentService/data/orthologies/ids/species/`

  defaultSpecies: Species = {
    displayName: 'Homo sapiens',
    taxId: '9606',
    dbId: 48887,
    shortName: 'H.sapiens',
    abbreviation: 'HSA'
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

  constructor(private http: HttpClient, private state: UrlStateService, private router: Router, private route: ActivatedRoute) {
    effect(() => {
      const newSpecies = this.abbreviationToSpecies().get(this.state.pathwayId()?.substring(2, 5) || '');
      if (newSpecies) this.currentSpecies.set(newSpecies);
    });
  }

  getClosestOrthologPathway(ancestors: Event[], newSpecies: Species): Observable<{
    pathway: Event | undefined,
    map: OrthologousMap,
  }> {
    return this.getOrthologousMap(
      ancestors.map((a) => a.stId),
      newSpecies.dbId)
      .pipe(map(orthologousMap => {
          for (const ancestor of ancestors.reverse()) { // Start from the end of ancestry, and gradually go up if there is no equivalent pathway
            if (orthologousMap[ancestor.stId]) return {
              pathway: orthologousMap[ancestor.stId],
              map: orthologousMap
            };
          }
          return {pathway: undefined, map: orthologousMap}; // If selection has no ortholog, it might be because it's a molecule, if so return initial
        })
      )
  }

  private getOrthologousMap(identifiers: string[], speciesDbId: number): Observable<OrthologousMap> {
    const url = `${this._ORTHOLOGIES}${speciesDbId}`;
    return this.http.post<OrthologousMap>(url, identifiers.join(','), {headers: new HttpHeaders({'Content-Type': 'text/plain'})}).pipe(
      catchError(e => of({}))
    );
  }

  getOrtholog(identifier: string | number | null, speciesDbID: number): Observable<Event | null> {
    if (!identifier) return of(null);
    return this.http.get<Event>(`${environment.host}/ContentService/data/orthology/${identifier}/species/${speciesDbID}`);
  }


  private setShortName(s: Species): Species {
    const [genus, species, ..._] = s.displayName.split(' ');
    return {...s, shortName: `${genus.charAt(0)}. ${species}`};
  }

  updateQueryParams(pathwayId: string | undefined, formerSpecies: Species, newSpecies: Species) {
    const queryParams = JSON.parse(
      JSON.stringify(this.route.snapshot.queryParams)
        .replaceAll(`-${formerSpecies.abbreviation}-`, `-${newSpecies.abbreviation}-`)
    );
    this.router.navigate(['/PathwayBrowser', pathwayId].filter(isDefined), {
      queryParams,
      queryParamsHandling: "replace",
      preserveFragment: true
    });
  }

}
