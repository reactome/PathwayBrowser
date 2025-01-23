import {Injectable} from '@angular/core';
import { HttpClient, HttpHeaders } from "@angular/common/http";
import {BehaviorSubject, map, Observable, of, tap} from "rxjs";
import {environment} from "../../environments/environment";
import {OrthologousMap, Species} from "../model/species.model";
import {Event} from "../model/graph/event.model";
import {DiagramStateService} from "./diagram-state.service";
import {ActivatedRoute} from "@angular/router";

@Injectable({
  providedIn: 'root'
})
export class SpeciesService {

  private readonly _MAIN_SPECIES = `${environment.host}/ContentService/data/species/main`;
  private readonly _ORTHOLOGIES = `${environment.host}/ContentService/data/orthologies/ids/species/`

  defaultSpecies = {displayName: 'Homo sapiens', taxId: '9606', dbId: 48887, shortName: 'H.sapiens'};
  private _currentSpeciesSubject = new BehaviorSubject<Species>(this.defaultSpecies);
  public currentSpecies$ = this._currentSpeciesSubject.asObservable();

  orthologousMap: OrthologousMap = {};

  private _ignore = false; // ignore the changes from species
  /**
   * This map is to help get current species value from the diagramId string when loading data. For instance:
   *  diagramId = R-HSA-4090294 then current species is H.sapiens, and then it will be selected in the species list
   */
  readonly abbreviationToSpecies: Map<string, Species> = new Map<string, Species>([
    ['HSA', {displayName: 'Homo sapiens', taxId: '9606', dbId: 48887, shortName: 'H.sapiens'}],
    ['BTA', {displayName: 'Bos taurus', taxId: '9913', dbId: 48898, shortName: 'B.taurus'}],
    ['CEL', {displayName: 'Caenorhabditis elegans', taxId: '6239', dbId: 68320, shortName: 'C.elegans'}],
    ['CFA', {displayName: 'Canis familiaris', taxId: '9615', dbId: 49646, shortName: 'C.familiaris'}],
    ['DRE', {displayName: 'Danio rerio', taxId: '7955', dbId: 68323, shortName: 'D.rerio'}],
    ['DDI', {displayName: 'Dictyostelium discoideum', taxId: '44689', dbId: 170941, shortName: 'D.discoideum'}],
    ['DME', {displayName: 'Drosophila melanogaster', taxId: '7227', dbId: 56210, shortName: 'D.melanogaster'}],
    ['GGA', {displayName: 'Gallus gallus', taxId: '9031', dbId: 49591, shortName: 'G.gallus'}],
    ['MMU', {displayName: 'Mus musculus', taxId: '10090', dbId: 48892, shortName: 'M.musculus'}],
    ['MTU', {displayName: 'Mycobacterium tuberculosis', taxId: '1773', dbId: 176806, shortName: 'M.tuberculosis'}],
    ['PFA', {displayName: 'Plasmodium falciparum', taxId: '5833', dbId: 170928, shortName: 'P.falciparum'}],
    ['RNO', {displayName: 'Rattus norvegicus', taxId: '10116', dbId: 48895, shortName: 'R.Rorvegicus'}],
    ['SCE', {displayName: 'Saccharomyces cerevisiae', taxId: '4932', dbId: 68322, shortName: 'S.cerevisiae'}],
    ['SPO', {displayName: 'Schizosaccharomyces pombe', taxId: '4896', dbId: 68324, shortName: 'S.pombe'}],
    ['SSC', {displayName: 'Sus scrofa', taxId: '99823', dbId: 49633, shortName: 'S.scrofa'}],
    ['XTR', {displayName: 'Xenopus tropicalis', taxId: '8364', dbId: 205621, shortName: 'X.tropicalis'}]
  ]);


  constructor(private http: HttpClient, private state: DiagramStateService) {
  }

  setIgnore(value: boolean) {
    this._ignore = value;
  }

  getIgnore(): boolean {
    return this._ignore;
  }

  getSpecies(): Observable<Species[]> {
    return this.http.get<Species[]>(this._MAIN_SPECIES, {
      headers: new HttpHeaders({'Content-Type': 'application/json;charset=UTF-8'})
    });
  }

  getOrthologousMap(identifiers: string, speciesDbId: number): Observable<OrthologousMap> {
    const url = `${this._ORTHOLOGIES}${speciesDbId}`;
    return this.http.post<OrthologousMap>(url, identifiers, {headers: new HttpHeaders({'Content-Type': 'text/plain'})});
  }


  setShortName(s: Species) {
    const parts = s.displayName.split(' ');
    // If there are not exactly two parts, return the original string
    if (parts.length !== 2) {
      throw new Error('Invalid species name format. Expected "Genus species".');
    }
    const genus = parts[0];
    const species = parts[1];
    s.shortName = `${genus.charAt(0)}.${species}`;
  }

  setCurrentSpecies(species: Species) {
    this._currentSpeciesSubject.next(species);
  }

  public setSpeciesFromDiagramId(diagramId: string) {
    // Find the value between the hyphens
    const speciesTerm = diagramId.match(/-(.*?)-/);
    let species;
    if (speciesTerm) {
      // speciesTerm[0] = -HSA-, speciesTerm[0] = HSA
      species = this.abbreviationToSpecies.get(`${speciesTerm[1]}`)
      if (species) {
        this.setCurrentSpecies(species);
      }
    }
  }


  getOrthologyEventStId(species: Species, selectedId: number | undefined, ancestors: Event[], ids: string[]): Observable<string> {

    if (!selectedId) return of('');
    // Only need to post all ids from URL, however the API call requires dbId as content, that's why ancestors is here
    const idsToPost: number[] = [];
    ancestors.forEach(a => {
      if (ids.includes(a.stId)) {
        idsToPost.push(a.dbId);
      }
    });

    const speciesDbId = species.dbId;
    let newSelectedId: string = '';
    return this.getOrthologousMap(idsToPost.join(','), speciesDbId).pipe( // can't send array to API call
      tap(response => {
        this.orthologousMap = response;
        if (this.orthologousMap[selectedId]) {
          newSelectedId = this.orthologousMap[selectedId].stId;
        } else {
          newSelectedId = '';
        }
      }),
      map(() => newSelectedId)
    );
  }

  getIdsFromURL(diagramId: string) {
    let ids: string[] = []
    ids.push(diagramId);
    if (this.state.get('select')) {
      ids.push(this.state.get('select'));
    }
    if (this.state.get('path')) {
      ids = ids.concat(this.state.get('path'));
    }
    return ids;
  }


  updateQueryParams(paramNames: string[], selectedId: string, abbreviation: string, route: ActivatedRoute) {
    // Create a new params object from the current query parameters
    const newParams = {...route.snapshot.queryParams};
    paramNames.forEach(param => {
      const value = newParams[param];
      const updateValue = (str: string) => str.replace(/-(.*?)-/, `-${abbreviation}-`);
      if (value) {
        if (param === 'select') {
          if (selectedId) {
            newParams[param] = updateValue(value);
          } else {
            // Remove 'select' if selectedId is empty
            // delete newParams[param];
            newParams[param] = '';
          }
        } else if (param === 'path') {
          newParams[param] = value
            .split(',')
            .map((s: string) => updateValue(s))
            .join(',');
        } else {
          newParams[param] = updateValue(value);
        }
      }
    });
    return newParams;
  }

}
