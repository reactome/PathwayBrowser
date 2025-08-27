import {Component, computed, effect, ElementRef, input, linkedSignal, signal, viewChild} from '@angular/core';
import {MatIconButton} from "@angular/material/button";
import {MatIcon} from "@angular/material/icon";
import {FormsModule} from "@angular/forms";
import {rxResource, toObservable} from "@angular/core/rxjs-interop";
import {HttpClient} from "@angular/common/http";
import {CONTENT_SERVICE, environment} from "../../../environments/environment";
import {BehaviorSubject, catchError, Observable, of, Subscription, switchMap, take} from "rxjs";
import {animate, sequence, state, style, transition, trigger} from "@angular/animations";
import {SpeciesService} from "../../services/species.service";
import {UrlStateService} from "../../services/url-state.service";
import {CollectionViewer, DataSource} from "@angular/cdk/collections";
import {CdkFixedSizeVirtualScroll, CdkVirtualForOf, CdkVirtualScrollViewport} from "@angular/cdk/scrolling";
import {MatProgressSpinner} from "@angular/material/progress-spinner";
import {IconService} from "../../services/icon.service";
import {MatTooltip} from "@angular/material/tooltip";
import {MatCheckbox} from "@angular/material/checkbox";
import {FlagButtonComponent} from "../../details/common/flag-button/flag-button.component";
import Entry = Search.Entry;
import {ShadowScrollComponent} from "../../shared/shadow-scroll/shadow-scroll.component";

const MIN_SUGGEST_LENGTH = 2;
const AVAILABLE_IN_HEIGHT = 20;

type Scope = 'local' | 'global';

@Component({
  selector: 'cr-search',
  imports: [
    MatIconButton,
    MatIcon,
    FormsModule,
    CdkVirtualScrollViewport,
    CdkFixedSizeVirtualScroll,
    CdkVirtualForOf,
    MatProgressSpinner,
    MatTooltip,
    MatCheckbox,
    FlagButtonComponent,
    ShadowScrollComponent,
  ],
  templateUrl: './search.component.html',
  styleUrl: './search.component.scss',
  animations: [
    trigger('suggest', [
      transition(':enter', [
        style({height: '0'}),
        animate('500ms ease-in-out', style({height: '*'})),
      ]),
      transition(':leave', [
        animate('500ms ease-in-out', style({height: '0'})),
      ])
    ]),
    trigger('results', [
      transition(':enter', [
        style({height: '0'}),
        animate('500ms ease-in-out', style({height: '*'})),
      ]),
      transition(':leave', [
        animate('500ms ease-in-out', style({height: '0'})),
      ])
    ]),
    trigger('result-pathways', [
      transition(':enter', [
        style({width: 0, minWidth: '0%'}),
        animate('500ms linear', style({width: '50%', minWidth: '50%'})),
      ]),
      transition(':leave', [
        animate('500ms linear', style({minWidth: '0%'})),
      ])
    ]),
    trigger('collapsable', [
      transition(':enter', [
        style({height: '0'}),
        animate('500ms ease-in-out', style({height: '*'})),
      ]),
      transition(':leave', [
        style({height: '*'}),
        sequence([
          animate('500ms ease-in', style({height: '0'})),
          animate('10ms linear', style({padding: '0 0', marginTop: '-4px'})),
        ])
      ])
    ]),
    trigger('collapse-button', [
      state('collapsed', style({
        bottom: '-13px',
        transform: 'scale(1, -1)'
      })),
      state('opened', style({
        bottom: '4px',
        transform: 'scale(1, 1)'
      })),
      transition('* <=> *', animate('500ms ease-in-out')),
    ])
  ]
})
export class SearchComponent {

  searchText = signal('');
  hasFocus = signal<boolean>(false);
  open = signal(false);

  inputBox = viewChild.required<ElementRef<HTMLDivElement>>('inputBox');
  query = viewChild.required<ElementRef<HTMLInputElement>>('query');

  suggestions = rxResource({
    request: this.searchText,
    loader: params => params.request.length >= MIN_SUGGEST_LENGTH
      ? this.http.get<string[]>(`${CONTENT_SERVICE}/search/suggest`, {params: {query: params.request}})
      : of([])
  });

  suggestionResults = linkedSignal<{ value?: string[], loading: boolean }, string[]>({
    source: () => ({value: this.suggestions.value(), loading: this.suggestions.isLoading()}),
    computation: (source, previous) => (source.loading ? previous?.value : source.value) || [],
  })

  suggestionIndex = linkedSignal(() => this.suggestionResults() && -1)
  currentSuggest = computed(() => this.suggestionIndex() !== -1
    ? this.searchText() + this.suggestionResults().at(this.suggestionIndex())!.slice(this.searchText().length)
    : undefined);

  resultsScroll = viewChild<CdkVirtualScrollViewport>('resultScroll')
  resultPathways = viewChild<ShadowScrollComponent>('resultPathways')


  constructor(
    private http: HttpClient,
    private species: SpeciesService,
    public state: UrlStateService,
    public icons: IconService) {
    effect(() => this.typeFilter() && this.searchParams.update(params => (params ? {
      ...params,
      types: this.typeFilter()
    } : undefined)));
    effect(() => this.diagram() && this.searchParams.update(params => (params ? {
      ...params,
      diagram: this.diagram()
    } : undefined)));
    effect(() => {
      const subs = [this.resultHeight(), this.resultsScroll()];
      setTimeout(() => this.resultsScroll()?.checkViewportSize(), 500); // After opening animation
    });
    effect(() => {
      if (!this.state.pathwayId()) this.currentScopeName.set('global');
    });
    effect(() => {
      const loading = this.scopes.local.isLoading();
      const local = this.scopes.local.found();
      const global = this.scopes.global.found();
      if (!loading && local === 0 && global !== 0) this.currentScopeName.set('global')
    });
    effect(() => {
      const [active, inactive] = this.currentScopeName() === 'global'
        ? [this.scopes.global, this.scopes.local]
        : [this.scopes.local, this.scopes.global];
      active.active = true;
      inactive.active = false;
    })
    effect(() => {
      if (this.selectedResultPathwaysStable().length === 1) {
        this.state.pathwayId.set(this.selectedResultPathwaysStable().at(0)!.stId)
        this.state.select.set(this.selectedResult()?.stId || null)
      }
    })

    effect(() => {
      this.selectedResultPathwaysStable().length > 1 && setTimeout(() => {
        this.resultPathways()?.elementRef?.nativeElement?.querySelector('.selected')?.scrollIntoView({behavior: 'smooth'})
        setTimeout(() => this.resultPathways()?.updateShadows(), 100)
      }, 500)
    });
  }

  nextSuggest(event?: Event) {
    const length = this.suggestionResults().length - 1;
    this.suggestionIndex.update(i => i + 1 <= length ? i + 1 : length);
    event?.preventDefault();
  }

  previousSuggest(event?: Event) {
    this.suggestionIndex.update(i => i > 0 ? i - 1 : 0);
    event?.preventDefault();
  }

  search(searchText?: string, event?: Event) {
    searchText = searchText || this.searchText();
    this.query().nativeElement.blur();
    this.searchText.set(searchText);
    if (event) event.preventDefault();
    this.collapsed.set('opened')
    console.log('searching', searchText);
    this.typeFilter.set([])
    this.selectedResult.set(undefined)
    this.searchParams.set({
      query: searchText,
      diagram: this.state.pathwayId() || '',
      species: this.species.currentSpecies().displayName
    })
  }

  clear($event: Event) {
    this.searchText.set('')
    this.searchParams.set(undefined);
    this.hasFocus.set(false)
    $event.preventDefault();
    $event.stopPropagation();
  }

  focusIn($event: FocusEvent, query: HTMLInputElement) {
    if ($event.target === query) this.hasFocus.set(true);
  }

  focusOut($event: FocusEvent) {
    if (!this.inputBox().nativeElement.contains($event.relatedTarget as Node)) this.hasFocus.set(false);
  }

  typeFilter = signal<string[]>([])
  diagram = this.state.pathwayId
  searchParams = signal<Search.Params | undefined>(undefined)
  searchParams$ = toObservable(this.searchParams)

  currentScopeName = signal<Scope>('local')

  scopes: Record<Scope, SearchDataSource> = {
    local: new SearchDataSource(this.searchParams$,
      (page, pageSize, params) => params.diagram && params.query.length > 0 ?
        this.http.get<Search.Result>(`${CONTENT_SERVICE}/search/diagram/${params.diagram}`, {
          params: {
            ...params,
            start: page * pageSize,
            rows: pageSize,
            includeInteractors: false,
            scope: 'REFERENCE_ENTITY'
          } as Search.Paginated<Search.Params>
        })
        : of(Search.EMPTY_RESULTS)
    ),
    global: new SearchDataSource(this.searchParams$,
      (page, pageSize, params) => params.query.length > 0 ?
        this.http.get<Search.Result>(`${CONTENT_SERVICE}/search/fireworks/`, {
          params: {
            ...params,
            start: page * pageSize,
            rows: pageSize,
            includeInteractors: false,
            scope: 'REFERENCE_ENTITY'
          } as Search.Paginated<Search.Params>
        })
        : of(Search.EMPTY_RESULTS)
    )
  }

  currentScope = computed(() => this.scopes[this.currentScopeName()])

  resultHeight = computed(() => {
    const [scope, ...sources] = [this.currentScopeName(), this.scopes.local.found(), this.scopes.global.found()]
    return Math.min(this.scopes[scope].found(), 10) * this.entryHeight()
  })

  resultPathwaysHeight = computed(() => AVAILABLE_IN_HEIGHT + Math.min(this.selectedResultPathwaysStable().length, 10) * this.entryHeight())

  selectedResult = signal<Search.Entry | undefined>(undefined)
  selectedResultId = computed(() => this.selectedResult()?.dbId)
  selectedResultPathways = rxResource({
    request: this.selectedResultId,
    loader: ({request}) => this.http.get<Search.Entry[]>(`${CONTENT_SERVICE}/search/pathways/of/${request}`, {
      params: {
        includeInteractors: false,
        directlyInDiagram: true,
        species: this.species.currentSpecies().displayName,
        fields: [' DB_ID', 'ST_ID', 'NAME', 'HAS_EHLD']
      }
    }),
  })

  selectedResultPathwaysStable = linkedSignal<{ results?: Search.Entry[], loading: boolean }, Search.Entry[]>({
    source: () => ({results: this.selectedResultPathways.value(), loading: this.selectedResultPathways.isLoading()}),
    computation: ({results, loading}, previous) => (loading ? previous?.value : results) || [],
  })

  entryHeight = input(24)
  trackEntry = (index: number, value: Search.Entry | undefined) => value?.dbId || index


  toggleTypeFacet(name: string) {
    this.typeFilter.update(filter => filter.includes(name) ? filter.filter(f => f !== name) : [...filter, name])
  }

  collapsed = signal<'collapsed' | 'opened'>('opened')

  toggleCollapse() {
    this.collapsed.update(c => c === 'collapsed' ? 'opened' : 'collapsed')
  }

  toggleSelection(entry: Entry | undefined) {
    if (entry) this.selectedResult.update(current => current === entry ? undefined : entry)
    this.state.select.set(this.selectedResult()?.stId || null)
  }
}


// TODO find a way to avoid the break in scroll when loading a new page
export class SearchDataSource extends DataSource<Search.Entry | undefined> {

  private _result = signal<Search.Result | undefined>(undefined)
  facets = computed(() => this._result()?.facets || [])
  found = computed(() => this._result()?.found || 0)
  isLoading = signal<boolean>(false)
  pageSize = 30;
  private fetchedPages = new Set<number>();
  private cachedEntries: (Search.Entry | undefined)[] = [];
  private dataStream = new BehaviorSubject<(Search.Entry | undefined)[]>(this.cachedEntries);
  private subscription = new Subscription();
  private viewerToSubscription = new Map<CollectionViewer, Subscription>();
  active = false;

  constructor(
    private param$: Observable<Search.Params | undefined>,
    private fetcher: (page: number, pageSize: number, params: Search.Params) => Observable<Search.Result>
  ) {
    super();
    param$.subscribe(() => this.clear());
  }

  clear(): void {
    this.cachedEntries.splice(0, this.cachedEntries.length);
    this.fetchedPages.clear();
    this.fetchPage(0)
  }

  override connect(collectionViewer: CollectionViewer): Observable<(Search.Entry | undefined)[]> {
    const subscribe = collectionViewer.viewChange.subscribe(range => {
      if (!this.active) return;
      const startPage = this.getPageForIndex(range.start);
      const endPage = this.getPageForIndex(range.end - 1);
      for (let i = startPage; i <= endPage; i++) {
        this.fetchPage(i);
      }
    });
    this.subscription.add(subscribe);
    this.viewerToSubscription.set(collectionViewer, subscribe);
    return this.dataStream;
  }

  override disconnect(collectionViewer: CollectionViewer): void {
    this.subscription.remove(this.viewerToSubscription.get(collectionViewer)!);
    this.viewerToSubscription.delete(collectionViewer);
  }

  private getPageForIndex(index: number): number {
    return Math.floor(index / this.pageSize);
  }

  private fetchPage(page: number) {
    if (this.fetchedPages.has(page)) {
      return;
    }
    this.isLoading.set(true);
    this.fetchedPages.add(page);
    // Use `setTimeout` to simulate fetching data from server.
    this.param$.pipe(
      take(1),
      switchMap(param => param ? this.fetcher(page, this.pageSize, param) : of(Search.EMPTY_RESULTS)),
      catchError(err => of(Search.EMPTY_RESULTS))
    ).subscribe(result => {
      this._result.set(result);
      if (this.cachedEntries.length !== result.found) this.cachedEntries.length = result.found;
      this.cachedEntries.splice(page * this.pageSize, this.pageSize, ...result.entries);
      this.dataStream.next(this.cachedEntries);
      this.isLoading.set(false);
    })
  }
}


namespace Search {
  export const EMPTY_RESULTS = {found: 0, facets: [], entries: []} as Search.Result;

  export interface Params extends Record<string, any> {
    query: string
    species?: string
    diagram?: string
    types?: string[],
    includeInteractors?: boolean
  }

  export type Paginated<T> = T & {
    start: number,
    rows: number
  }

  export interface Entry {
    dbId: string;
    stId: string;
    databaseName: string;
    exactType: string;
    isDisease: boolean;
    hasEHLD?: boolean;
    name: string;
    referenceIdentifier: string;
    referenceName: string;
    referenceURL: string;
    species: string[];
    compartmentAccession: string[];
    compartmentNames: string[];
  }

  export interface Facet {
    name: string;
    count: number;
  }

  export interface Result {
    entries: Entry[];
    facets: Facet[];
    found: number
  }
}

