import {computed, effect, Injectable, linkedSignal, signal, WritableSignal} from '@angular/core';
import {catchError, Observable, of, switchMap, tap} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {environment} from "../../environments/environment";
import {Analysis} from "../model/analysis.model";
import {UrlStateService} from "./url-state.service";
import chroma, {Color, Scale} from "chroma-js";
import {extract, Style} from "reactome-cytoscape-style";
import {rxResource, toObservable} from "@angular/core/rxjs-interop";
import {DarkService} from "./dark.service";
import {DataStateService} from "./data-state.service";
import {Params} from "@angular/router";
import {cleanObject} from "../reacfoam/reacfoam.service";
import {isDefined, shouldBeScientificFormat} from "./utils";
import NotFoundIdentifier = Analysis.NotFoundIdentifier;

export interface Pagination extends Params {
  page: number,
  pageSize: number
}

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
  private _domain: [number, number] = [0, 1]

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

  noData(color: string | chroma.Color) {
    // @ts-ignore
    this.scale.nodata(color)
    return this
  }

  domain(min: number, max: number) {
    this._domain = [min, max]
    this.scale = this.scale.domain(this._domain)
    return this;
  }

  classes(n: number) {
    this.scale = this.scale.classes(n)
    this.n = n
    return this;
  }


  getGradient(direction: 'top' | 'bottom' | 'left' | 'right') {
    return this.n === -1 ?
      `linear-gradient(to ${direction} in oklab, ${this.colors.join(', ')})` :
      `linear-gradient(to ${direction} in oklab, ${this.scale.colors(this.n).map((c, i) => `${c} ${i / this.n * 100}%, ${c} ${(i + 1) / this.n * 100}%`).join(', ')})`
  }

  get verticalGradient(): string {
    return this.getGradient('top')
  }

  get horizontalGradient(): string {
    return this.getGradient('right')
  }

  get colors() {
    return this.isDark ? this.darkColors : this.lightColors;
  }

  get domainRange() {
    return [...this._domain];
  }

  set dark(isDark: boolean) {
    this.isDark = isDark;
    this.scale = chroma.scale(this.colors)
      .mode('oklab')
      .padding(this.padding)
      .domain(this._domain)
      .classes(this.n) // ALWAYS put classes after domain otherwise create bugs https://github.com/gka/chroma.js/issues/371
  }
}


export type Examples = 'uniprot' | 'microarray' | 'cancer-gene-census' | 'extreme';

@Injectable({
  providedIn: 'root'
})
export class AnalysisService {
  style: Style = new Style(document.body);

  paletteOptions: Map<PaletteName, PaletteSummary> = new Map([
    ...Object.keys(chroma.brewer)
      .filter(name => name.toLowerCase() !== name)
      .map(name => ([name, new PaletteSummary(name as StandardPalette)] as [StandardPalette, PaletteSummary])),
    ['ancient', new PaletteSummary(['#1532b3', extract(this.style.properties.global.surface), '#e5e61d'])],
    ['primary', new PaletteSummary([extract(this.style.properties.global.primaryContainer), extract(this.style.properties.global.primary)])]
  ]);

  fdrScale = computed(() => new PaletteSummary([
    extract(this.style.properties.global.primaryContainer),
    extract(this.style.properties.global.primary)])
    .domain(0.05, 0)
    .noData(extract(this.style.properties.analysis.notFound))
  )


  typeToDefaultPalette = new Map<Analysis.Type, PaletteName>([
    ['GSA_REGULATION', 'ancient'],
    ['EXPRESSION', 'Viridis'],
    ['OVERREPRESENTATION', 'primary'],
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
        'primary',
        // 'Greys',
        // 'Purples',
        // 'Blues', 'Greens', 'Oranges', 'Reds',
        // 'BuPu',
        'RdPu',
        // 'PuRd',
        // 'GnBu', 'YlGnBu', 'PuBu',
        // 'PuBuGn',
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

  resultResource = rxResource({
    request: () => ({
      token: this.state.analysis(),
      resource: this.state.resourceFilter(),
      species: this.state.speciesFilter()
    }),
    loader: ({request}) => {
      console.log("Loading ", request)
      return request.token ?
        this.loadAnalysis(request.token, {
          resource: request.resource || undefined,
          species: request.species.join(',')
        }) :
        of(undefined)
    }
  });

  // Avoid resetting to undefined while waiting for loading
  result = linkedSignal<Analysis.Result | undefined, Analysis.Result | undefined>({
    source: this.resultResource.value,
    computation: (source, previous) => {
      return source || (
        this.state.analysis() ?
          previous?.value : // If source is null but we have a token, it means we are just loading the data, so we keep the previous
          undefined
      );
    }
  })

  result$ = toObservable(this.result)


  summary = computed(() => this.result()?.summary)
  hasInteractors = computed(() => this.summary()?.interactors === true)
  type = computed(() => this.summary()?.type as Analysis.Type | undefined)
  isGSA = computed(() => this.type() === 'GSA_REGULATION');

  samples = computed(() => this.result()?.expression.columnNames || [])
  sampleIndex = linkedSignal({
    source: () => ({result: this.result(), sample: this.state.sample()}),
    computation: ({result, sample}) =>
      Math.max(// Avoid -1 value from indexOf
        result &&
        sample &&
        result?.expression.columnNames?.indexOf(sample) ||
        0, 0
      )
  })

  expressionScientificFormat = computed(() => {
    const result = this.result();
    const expressions = result?.expression;
    if (!result || !expressions) return false
    return shouldBeScientificFormat([
      expressions.min,
      expressions.max,
      result!.pathways.at(0)?.entities.exp.at(0),
      result!.pathways.at(-1)?.entities.exp.at(-1)
    ].filter(isDefined))
  })

  resourceFilter = this.state.resourceFilter
  resourceOptions = computed(() => this.result()?.resourceSummary || [])
  resourceFilterActive = computed(() => this.state.resourceFilter() !== null && this.state.resourceFilter() !== 'TOTAL')
  speciesOptions = computed(() => this.result()?.speciesSummary || [])
  speciesFilterActive = computed(() => this.state.speciesFilter().length !== 0)


  constructor(private http: HttpClient,
              private state: UrlStateService,
              private data: DataStateService,
              private darkS: DarkService) {
    effect(() => {
      [...this.paletteOptions.values()].forEach(summary => summary.dark = this.darkS.isDark())
    });

    effect(() => {
      const result = this.result();
      console.log('Result updated', result)
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
        summary.domain(
          result.expression.min === undefined ? 0.05 : result.expression.min,
          result.expression.max === undefined ? 0 : result.expression.max
        );
        summary.classes(result.summary.type === 'GSA_REGULATION' ? 5 : -1); // ALWAYS put classes after domain otherwise create bugs https://github.com/gka/chroma.js/issues/371
      }

      this.state.sample.set(result?.expression.columnNames[0] || null)

      this.paletteGroups.forEach(group => group.valid = validGroups.has(group.name))
    });

  }

  private clearFilters() {
    this.state.minExpressionFilter.set(undefined)
    this.state.maxExpressionFilter.set(undefined)
    this.state.fdrFilter.set(undefined)
    this.state.gsaFilter.set([])
    this.state.pathwayMinSizeFilter.set(undefined)
    this.state.pathwayMaxSizeFilter.set(undefined)
    this.state.includeGrouping.set(undefined)
    this.state.includeDisease.set(undefined)
  }

  clearAnalysis() {
    // this.result = undefined;
    this.state.analysis.set(null);
    this.state.sample.set(null);
    this.clearFilters();
  }

  analyse(data: string, params?: Partial<Analysis.Parameters>): Observable<Analysis.Result> {
    return this.http.post<Analysis.Result>(`${environment.host}/AnalysisService/identifiers/${params?.disableProjectToHuman ? '' : 'projection'}`, data, {params}).pipe(
      tap(result => this.result.set(result)),
      tap(result => this.resultResource.set(result)),
      tap(result => this.clearFilters()),
      tap(result => this.state.analysis.set(result.summary.token)),
    )
  }

  loadAnalysis(token?: string, params?: Partial<Analysis.Parameters>): Observable<Analysis.Result> {
    cleanObject(params || {})
    return this.http.get<Analysis.Result>(`${environment.host}/AnalysisService/token/${token || this.state.analysis()}`, {params})
  }

  foundEntities(pathway: string, token?: string, resource: Analysis.Resource = 'TOTAL'): Observable<Analysis.FoundEntities> {
    return this.http.get<Analysis.FoundEntities>(`${environment.host}/AnalysisService/token/${token || this.state.analysis()}/found/all/${pathway}`, {
      params: {resource}
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

  example(name: Examples, params?: Partial<Analysis.Parameters>): Observable<Analysis.Result> {
    return this.http.get(`assets/data/analysis-examples/${name}.tsv`, {responseType: 'text'}).pipe(
      switchMap(example => this.analyse(example, params))
    )
  }

  getHitReactions(pathwayId: string, token: string, params?: Partial<Analysis.Parameters>) {
    if (!pathwayId || !token) return of([]);
    return this.http.get<number[]>(`${environment.host}/AnalysisService/token/${token}/reactions/${pathwayId}`, {params}).pipe(
    )
  }

  // Not Found

  notFoundPagination = signal<Pagination>({page: 1, pageSize: 40})

  notFoundIdentifiersResource = rxResource({
    request: () => ({token: this.state.analysis(), pagination: this.notFoundPagination()}),
    loader: ({request}) => request.token ?
      this.notFound(request.token, request.pagination) :
      of([])
  })

  notFound(token: string, pagination: Pagination): Observable<NotFoundIdentifier[]> {
    return this.http.get<NotFoundIdentifier[]>(`${environment.host}/AnalysisService/token/${token}/notFound`, {
      params: pagination
    })
  }

}
