import {computed, effect, Injectable, linkedSignal, signal, Signal, WritableSignal} from '@angular/core';
import {catchError, Observable, of, switchMap, tap} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {environment} from "../../environments/environment";
import {Analysis} from "../model/analysis.model";
import {UrlStateService} from "./url-state.service";
import chroma, {Color, Scale} from "chroma-js";
import {extract, Style} from "reactome-cytoscape-style";
import {toObservable, toSignal} from "@angular/core/rxjs-interop";
import {DarkService} from "./dark.service";


export type StandardPalette = keyof typeof chroma.brewer;

export type CustomPalette = 'ancient' | 'primary';

export type PaletteName = CustomPalette | StandardPalette;

export type PaletteGroup = 'sequential' | 'diverging' | 'continuous';

export class PaletteSummary {

  lightColors: Color[];
  darkColors: Color[];
  scale: Scale;
  n = -1
  isDark = false;
  padding = 0

  constructor(private data: StandardPalette | string[]) {
    if (typeof data === "string") {
      this.padding = 0.1;
      this.scale = chroma.scale(data).padding(this.padding);
      this.lightColors = this.scale.colors(20).map(s => chroma(s))
    } else { // Different functions being called, though same name according to typescript
      this.scale = chroma.scale(data)
      this.lightColors = data.map(s => chroma(s))
    }


    this.darkColors = this.lightColors.map(color => {
      const [h, s, l] = color.hsl();
      return chroma.hsl(h, s, 1 - l)
    })
    this.scale.mode('oklab')
  }

  classes(n: number) {
    this.scale = this.scale.classes(n)
    this.n = n
  }

  domain(min: number, max: number) {
    this.scale = this.scale.domain([min, max])
  }

  get gradient(): string {
    return this.n === -1 ?
      `linear-gradient(to top in oklab, ${this.colors.join(', ')})` :
      `linear-gradient(to top in oklab, ${this.scale.colors(this.n).map((c, i) => `${c} ${i / this.n * 100}%, ${c} ${(i + 1) / this.n * 100}%`).join(', ')})`
  }

  get colors() {
    return this.isDark ? this.darkColors : this.lightColors;
  }

  set dark(isDark: boolean) {
    this.isDark = isDark;
    this.scale = chroma.scale(this.colors).mode('oklab').classes(this.n).padding(this.padding)
  }
}


export type Examples = 'uniprot' | 'microarray';

@Injectable({
  providedIn: 'root'
})
export class AnalysisService {
  style: Style = new Style(document.body);

  paletteOptions: Map<PaletteName, PaletteSummary> = new Map([
    ...Object.keys(chroma.brewer)
      .filter(name => name.toLowerCase() !== name)
      .map(name => ([name, new PaletteSummary(name as StandardPalette)] as [StandardPalette, PaletteSummary])),
    ['ancient', new PaletteSummary(['#1532b3', '#fff', '#e5e61d'])],
    ['primary', new PaletteSummary(['#fff', extract(this.style.properties.global.primary)])]
  ]);


  typeToDefaultPalette = new Map<Analysis.Type, PaletteName>([
    ['GSA_REGULATION', 'ancient'],
    ['EXPRESSION', 'RdPu'],
    ['OVERREPRESENTATION', 'RdPu'],
  ]);

  palette: WritableSignal<PaletteSummary> = linkedSignal({
    source: () => ({palette: this.state.palette(), type: this.type()}),
    computation: ({palette, type}) =>
      this.paletteOptions.get(
        palette ||
        this.typeToDefaultPalette.get(type || 'OVERREPRESENTATION')!
      )!
  })


  paletteGroups: { name: PaletteGroup, palettes: PaletteName[], valid: boolean }[] = [
    {
      name: 'sequential', valid: false, palettes: [
        // 'primary',
        // 'Greys',
        // 'Purples',
        // 'Blues', 'Greens', 'Oranges', 'Reds',
        // 'BuPu',
        'RdPu',
        // 'PuRd',
        // 'GnBu', 'YlGnBu', 'PuBu',
        'PuBuGn',
        'BuGn',
        // 'YlGn',
        // 'YlOrBr',
        'OrRd',
        // 'YlOrRd',
      ]
    },
    {
      name: 'diverging',
      valid: true,
      palettes: [
        'RdYlGn',
        // 'RdYlBu',
        // 'RdGy',
        'RdBu',
        // 'PuOr',
        // 'PRGn',
        'PiYG',
        // 'BrBG',
        'ancient'
      ]
    },
    {name: 'continuous', valid: false, palettes: ['Spectral', 'Viridis']},
  ];


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
      } else if (result.summary.type === 'EXPRESSION') {
        // validGroups.add('diverging')
        validGroups.add('sequential')
        validGroups.add('continuous')
      } else if (result.summary.type === 'OVERREPRESENTATION') {
        validGroups.add('sequential')
      }
      if (this.state.palette()) {
        const isValidPalette = [...validGroups.values()].some(validGroup =>
          this.paletteGroups.find(group => group.name === validGroup)
            ?.palettes.includes(this.state.palette()!)
        );
        if (!isValidPalette) this.state.palette.set(null)
      }

      for (let summary of this.paletteOptions.values()) {
        //@ts-ignore
        summary.scale.nodata(extract(this.style.properties.analysis.notFound))
        summary.classes(result.summary.type === 'GSA_REGULATION' ? 5 : -1);
        summary.domain(result.expression.min || 0, result.expression.max || 1);
      }

      this.state.sample.set(result?.expression.columnNames[0] || null)

      this.paletteGroups.forEach(group => group.valid = validGroups.has(group.name))
    })
  )

  resultSignal = toSignal(this.result$)
  type = computed(() => this.resultSignal()?.summary.type as Analysis.Type | undefined)
  samples = computed(() => this.resultSignal()?.expression.columnNames || [])
  sampleIndex = linkedSignal({
    source: () => ({result: this.resultSignal(), sample: this.state.sample()}),
    computation: ({result, sample}) =>
      Math.max(// Avoid -1 value from indexOf
        result &&
        sample &&
        result?.expression.columnNames?.indexOf(sample) ||
        0, 0
      )
  })

  dark = toSignal(this.darkS.$dark, {initialValue: false})

  constructor(private http: HttpClient, private state: UrlStateService, private darkS: DarkService) {
    effect(() => {
      [...this.paletteOptions.values()].forEach(summary => summary.dark = this.dark())
    });

  }

  clearAnalysis() {
    this.result = undefined;
    this.state.analysis.set(null);
    this.state.sample.set(null);
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
