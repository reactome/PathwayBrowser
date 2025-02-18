import {computed, Injectable} from '@angular/core';
import {catchError, Observable, of, switchMap, tap} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {environment} from "../../environments/environment";
import {Analysis} from "../model/analysis.model";
import {UrlStateService} from "./url-state.service";
import {brewer, Scale, scale} from "chroma-js";
import {extract, Style} from "reactome-cytoscape-style";
import {toObservable} from "@angular/core/rxjs-interop";


export type StandardPalette = keyof typeof brewer;

export type PaletteGroup = 'sequential' | 'diverging' | 'continuous';

// type PaletteSummary = { name: Palette, scale: Scale, gradient: string };

export class PaletteSummary {

  colors: string[];
  scale: Scale;
  gradient: string;

  constructor(private data: StandardPalette | string[]) {
    if (typeof data === "string") {
      this.scale = scale(data).padding(0.25)
      this.colors = brewer[data]
    } else { // Different functions being called, though same name according to typescript
      this.scale = scale(data)
      this.colors = data
    }
    this.scale.mode('oklab')

    this.gradient = `linear-gradient(to right in oklab, ${this.colors.join(', ')})`
  }

  classes(n: number) {
    if (n > 0) {
      this.scale.classes(n)
      this.gradient = `linear-gradient(to right in oklab, ${this.scale.colors(n).map((c, i) => `${c} ${i / n * 100}%, ${c} ${(i + 1) / n * 100}%`).join(', ')})`
    } else {
      this.scale.classes(-1)
      this.gradient = `linear-gradient(to right in oklab, ${this.colors.join(', ')})`
    }
  }

  domain(min: number, max: number) {
    this.scale = this.scale.domain([min, max])
  }
}


export type Examples = 'uniprot' | 'microarray';

@Injectable({
  providedIn: 'root'
})
export class AnalysisService {

  paletteOptions: Map<string, PaletteSummary> = new Map([
    ...Object.keys(brewer)
    .filter(name => name.toLowerCase() !== name)
    .map(name => ([name, new PaletteSummary(name as StandardPalette)] as [string, PaletteSummary])),
    ['original', new PaletteSummary(['#1532b3','#808080','#e5e61d'])]
  ]);

  palette: PaletteSummary = this.paletteOptions.get('RdBu')!;

  palettes: { name: PaletteGroup, palettes: StandardPalette[], valid: boolean }[] = [
    {
      name: 'sequential', valid: false, palettes: [
        'Greys', 'Purples', 'Blues', 'Greens', 'Oranges', 'Reds',
        'BuPu', 'RdPu', 'PuRd',
        'GnBu', 'YlGnBu', 'PuBu', 'PuBuGn',
        'BuGn', 'YlGn',
        'YlOrBr', 'OrRd', 'YlOrRd'
      ]
    },
    {name: 'diverging', valid: true, palettes: ['RdYlGn', 'RdYlBu', 'RdGy', 'RdBu', 'PuOr', 'PRGn', 'PiYG', 'BrBG']},
    {name: 'continuous', valid: false, palettes: ['Spectral', 'Viridis']},
  ];

  style: Style = new Style(document.body);

  result?: Analysis.Result;

  result$ = toObservable(this.state.analysis).pipe(
    switchMap(token =>
      token !== null ?
        (
          token === this.result?.summary.token
            ? of(this.result)// Same token as cache => use cache
            : this.loadAnalysis(token) // Different token than cache => load result
        ) :
        of(undefined) // No tokens => No results
    ),
    tap((result) => {
      if (!result) return
      const validGroups: Set<PaletteGroup> = new Set();
      if (result.summary.type === 'GSA_REGULATION') {
        validGroups.add('diverging')

        this.palette = this.paletteOptions.get('original')!
      } else if (result.summary.type === 'EXPRESSION') {
        validGroups.add('diverging')
        validGroups.add('sequential')
        validGroups.add('continuous')

        this.palette = this.paletteOptions.get('Viridis')!
      } else if (result.summary.type === 'OVERREPRESENTATION') {
        validGroups.add('sequential')

        this.palette = this.paletteOptions.get('RdBu')!
      }
      for (let summary of this.paletteOptions.values()) {
        //@ts-ignore
        summary.scale.nodata(extract(this.style.properties.analysis.notFound))
        summary.classes(result.summary.type === 'GSA_REGULATION' ? 5 : 0);
        summary.domain(result.expression.min || 0, result.expression.max || 1);
      }

      this.palettes.forEach(group => group.valid = validGroups.has(group.name))
    })
  )

  constructor(private http: HttpClient, private state: UrlStateService) {
  }

  clearAnalysis() {
    this.result = undefined;
    this.state.analysis.set(null);
  }

  analyse(data: string, params?: Partial<Analysis.Parameters>): Observable<Analysis.Result> {
    return this.http.post<Analysis.Result>(`${environment.host}/AnalysisService/identifiers/projection`, data, {params}).pipe(
      tap(result => this.result = result),
      tap(result => this.state.analysis.set(result.summary.token)),
    )
  }

  loadAnalysis(token?: string, params?: Partial<Analysis.Parameters>): Observable<Analysis.Result> {
    console.log('load analysis')
    if (token) this.state.analysis.set(token);
    return this.http.get<Analysis.Result>(`${environment.host}/AnalysisService/token/${token || this.state.analysis()}`, {params}).pipe(
      tap(result => this.result = result)
    )
  }

  foundEntities(pathway: string, token?: string, resource: Analysis.Resource = 'TOTAL'): Observable<Analysis.FoundEntities> {
    return this.http.get<Analysis.FoundEntities>(`${environment.host}/AnalysisService/token/${token || this.state.analysis()}/found/all/${pathway}`, {
      params: {
        resource
      }
    }).pipe(
      catchError(() => of({
        pathway,
        foundEntities: 0,
        foundInteractors: 0,
        expNames: [],
        entities: [],
        interactors: [],
        resources: [resource]
      }))
    )
  }

  pathwaysResults(pathwayIds: number[] | string[], token?: string, resource: Analysis.Resource = 'TOTAL'): Observable<Analysis.Pathway[]> {
    if (pathwayIds.length === 0) return of([]);
    return this.http.post<Analysis.Pathway[]>(`${environment.host}/AnalysisService/token/${token || this.state.analysis()}/filter/pathways`, pathwayIds.join(','), {
      params: {resource}
    }).pipe(
      catchError(() => of([]))
    )
  }

  example(name: Examples): Observable<Analysis.Result> {
    return this.http.get(`assets/data/analysis-examples/${name}.tsv`, {responseType: 'text'}).pipe(
      switchMap(example => this.analyse(example))
    )
  }

  getHitReactions(pathwayId: string, token: string, params?: Partial<Analysis.Parameters>) {
    if (!pathwayId || !token) return of([]);
    return this.http.get<number[]>(`${environment.host}/AnalysisService/token/${token}/reactions/${pathwayId}`, {params}).pipe(
    )
  }

}
