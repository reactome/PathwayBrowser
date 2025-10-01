import {computed, effect, Injectable, linkedSignal, signal, WritableSignal} from '@angular/core';
import {catchError, EMPTY, Observable, of, switchMap, tap} from "rxjs";
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
import {Report} from "reactome-gsa-form/lib/model/report-status.model";
import {Species} from "../model/graph/species.model";
import {SpeciesService} from "./species.service";
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


  getCssGradient(direction: 'top' | 'bottom' | 'left' | 'right') {
    return this.n === -1 ?
      `linear-gradient(to ${direction} in oklab, ${this.colors.join(', ')})` :
      `linear-gradient(to ${direction} in oklab, ${this.scale.colors(this.n).map((c, i) => `${c} ${i / this.n * 100}%, ${c} ${(i + 1) / this.n * 100}%`).join(', ')})`
  }

  get verticalGradient(): string {
    return this.getCssGradient('top')
  }

  get horizontalGradient(): string {
    return this.getCssGradient('right')
  }

  getSvgGradient(id: string, direction: 'top' | 'bottom' | 'left' | 'right') {
    // Map direction to SVG coords
    const dirMap: Record<typeof direction, [string, string, string, string]> = {
      top:    ["0%", "100%", "0%", "0%"],   // bottom → top
      bottom: ["0%", "0%", "0%", "100%"],   // top → bottom
      left:   ["100%", "0%", "0%", "0%"],   // right → left
      right:  ["0%", "0%", "100%", "0%"]    // left → right
    };

    const [x1, y1, x2, y2] = dirMap[direction];

    let stops: string;

    if (this.n === -1) {
      // Simple gradient: evenly spaced stops
      stops = this.colors.map((c, i) => {
        const offset = (i / (this.colors.length - 1)) * 100;
        return `<stop offset="${offset}%" stop-color="${c}" />`;
      }).join("\n");
    } else {
      // Quantized gradient: each color has a "band"
      stops = this.scale.colors(this.n).map((c: string, i: number) => {
        const start = (i / this.n) * 100;
        const end   = ((i + 1) / this.n) * 100;
        return `
        <stop offset="${start}%" stop-color="${c}" />
        <stop offset="${end}%" stop-color="${c}" />
      `;
      }).join("\n");
    }

    return `
    <linearGradient id="${id}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">
      ${stops}
    </linearGradient>
  `;
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

  paletteOptions: Map<PaletteName, PaletteSummary> = new Map(([
    ...Object.keys(chroma.brewer)
      .filter(name => name.toLowerCase() !== name)
      .map(name => ([name, new PaletteSummary(name as StandardPalette)] as [StandardPalette, PaletteSummary])),
    ['ancient', new PaletteSummary(['#1532b3', extract(this.style.properties.global.surface), '#e5e61d'])],
    ['primary', new PaletteSummary([extract(this.style.properties.global.primaryContainer), extract(this.style.properties.global.primary)])]
  ] as [PaletteName, PaletteSummary][]).map(([key, palette]) =>
    [key, palette.noData(extract(this.style.properties.analysis.notFound))]
  ));

  // Use primary palette if we have expression values, or the normal palette if we just represent FDR anyway
  fdrPalette = computed(() =>
    this.type() !== "OVERREPRESENTATION" && this.type() !== "SPECIES_COMPARISON" ?
      new PaletteSummary([
        extract(this.style.properties.global.primaryContainer),
        extract(this.style.properties.global.primary)])
        .domain(this.state.significance(), 0)
        .noData(extract(this.style.properties.analysis.notFound)) :
      this.palette()
  )


  typeToDefaultPalette = new Map<Analysis.Type, PaletteName>([
    ['GSA_REGULATION', 'ancient'],
    ['GSVA', 'Viridis'],
    ['EXPRESSION', 'Viridis'],
    ['OVERREPRESENTATION', 'primary'],
    ['SPECIES_COMPARISON', 'primary'],
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
    loader: ({request, previous}) => {
      console.log("Loading ", request, previous)
      return request.token ?
        this.loadAnalysis(request.token, {
          resource: request.resource || undefined,
          species: request.species.join(',')
        }) :
        EMPTY
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

  isLoading = linkedSignal(() => (this.result()?.summary?.token || null) !== this.state.analysis())

  pathwayStIdToData = computed(() => new Map<string, Analysis.Pathway>(this.result()?.pathways?.map(p => [p.stId, p])))

  result$ = toObservable(this.result)


  summary = computed(() => this.result()?.summary)
  hasInteractors = computed(() => this.summary()?.interactors === true)
  hasPValues = computed(() => this.result()?.summary?.type !== 'GSVA')
  type = computed(() => this.summary()?.type as Analysis.Type | undefined)
  species = computed(() => this.speciesService.allShortenSpecies()?.find(species => species.dbId === this.result()?.summary?.species))
  isGSARegulation = computed(() => this.type() === 'GSA_REGULATION');
  isGSA = computed(() => this.type() === 'GSA_REGULATION' || this.type() === 'GSVA');
  gsaReportsRequired = signal(false);
  gsaReports = signal<Report[] | undefined>(undefined);

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


  constructor(
    private http: HttpClient,
    private state: UrlStateService,
    private data: DataStateService,
    private darkS: DarkService,
    private speciesService: SpeciesService,
  ) {
    effect(() => {
      [...this.paletteOptions.values()].forEach(summary => summary.dark = this.darkS.isDark())
    });
    effect(() => this.resultResource.error() && this.state.analysis.set(null)) // remove token if it is wrong

    effect(() => {
      const result = this.result();
      console.log('Result updated', result)
      if (!result) return
      const validGroups: Set<PaletteGroup> = new Set();
      if (result.summary.type === 'GSA_REGULATION') {
        validGroups.add('diverging')
      } else if (result.summary.type === 'GSVA') {
        validGroups.add('sequential')
        validGroups.add('continuous')
      } else if (result.summary.type === 'EXPRESSION') {
        // validGroups.add('diverging')
        validGroups.add('sequential')
        validGroups.add('continuous')
      } else if (result.summary.type === 'OVERREPRESENTATION') {
        validGroups.add('sequential')
      } else if (result.summary.type === 'SPECIES_COMPARISON') {
        validGroups.add('sequential')
      }

      this.state.significance.set(result.summary.type !== 'GSVA' ? 0.05 : 1)

      if (this.state.palette()) {
        const isValidPalette = [...validGroups.values()].some(validGroup =>
          this.paletteGroups.find(group => group.name === validGroup)
            ?.palettes.includes(this.state.palette()!)
        );
        if (!isValidPalette) this.state.palette.set(null)
      }

      for (let summary of this.paletteOptions.values()) {
        //@ts-ignore
        summary.domain(
          result.expression.min === undefined ? this.state.significance() : result.expression.min,
          result.expression.max === undefined ? 0 : result.expression.max
        );
        summary.classes(result.summary.type === 'GSA_REGULATION' ? 5 : -1); // ALWAYS put classes after domain otherwise create bugs https://github.com/gka/chroma.js/issues/371
      }

      this.state.sample.set(result?.expression.columnNames[0] || null)

      this.paletteGroups.forEach(group => group.valid = validGroups.has(group.name))
    });
  }

  loadDefaultExample(name: string): Observable<Analysis.Result> {
    return this.http.get(`assets/data/analysis-examples/${name}.tsv`, {responseType: 'text'}).pipe(
      switchMap(example => this.analyse(example, {projectToHuman: true}, false)),
    )
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

  analyse(data: string, params?: Partial<Analysis.Parameters>, clearFilters = true): Observable<Analysis.Result> {
    this.isLoading.set(true)
    return this.http.post<Analysis.Result>(`${environment.host}/AnalysisService/identifiers/${params?.projectToHuman ? 'projection' : ''}`, data, {params}).pipe(
      tap(result => this.result.set(result)),
      tap(result => this.resultResource.set(result)),
      tap(result => clearFilters && this.clearFilters()),
      tap(result => this.state.analysis.set(result.summary.token)),
    )
  }

  analyseSpecies(species: Species, params?: Partial<Analysis.Parameters>, clearFilters = true): Observable<Analysis.Result> {
    this.isLoading.set(true)
    return this.http.get<Analysis.Result>(`${environment.host}/AnalysisService/species/homoSapiens/${species.dbId}`, {params}).pipe(
      tap(result => this.result.set(result)),
      tap(result => this.resultResource.set(result)),
      tap(result => clearFilters && this.clearFilters()),
      tap(result => this.state.analysis.set(result.summary.token)),
    )
  }

  analyseFromUrl(url: string, params?: Partial<Analysis.Parameters>, clearFilters = true): Observable<Analysis.Result> {
    this.isLoading.set(true)
    return this.http.post<Analysis.Result>(`${environment.host}/AnalysisService/identifiers/url${params?.projectToHuman ? '/projection' : ''}`, url, {params}).pipe(
      tap(result => this.result.set(result)),
      tap(result => this.resultResource.set(result)),
      tap(result => clearFilters && this.clearFilters()),
      tap(result => this.state.analysis.set(result.summary.token)),
    );
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

  getHitReactions(pathwayId: string, token: string, params?: Partial<Analysis.Parameters>) {
    if (!pathwayId || !token) return of([]);
    return this.http.get<number[]>(`${environment.host}/AnalysisService/token/${token}/reactions/${pathwayId}`, {params})
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
