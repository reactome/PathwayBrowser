import {Component, computed, effect, ElementRef, input, linkedSignal, signal, viewChild} from '@angular/core';
import {MatIconButton} from "@angular/material/button";
import {MatIcon} from "@angular/material/icon";
import {FormsModule} from "@angular/forms";
import {rxResource, toObservable} from "@angular/core/rxjs-interop";
import {HttpClient} from "@angular/common/http";
import {environment} from "../../../environments/environment";
import {BehaviorSubject, catchError, Observable, of, Subscription, switchMap, take} from "rxjs";
import {animate, state, style, transition, trigger} from "@angular/animations";
import {SpeciesService} from "../../services/species.service";
import {UrlStateService} from "../../services/url-state.service";
import {CollectionViewer, DataSource} from "@angular/cdk/collections";
import {CdkFixedSizeVirtualScroll, CdkVirtualForOf, CdkVirtualScrollViewport} from "@angular/cdk/scrolling";
import {MatProgressSpinner} from "@angular/material/progress-spinner";
import {IconService} from "../../services/icon.service";
import {MatTooltip} from "@angular/material/tooltip";
import {MatCheckbox} from "@angular/material/checkbox";
import {has} from "lodash";

const MIN_SUGGEST_LENGTH = 2;

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
    trigger('collapsable', [
      state('collapsed', style({height: '0', padding: '0 0', marginTop: '-4px'})),
      state('opened', style({height: '*', padding: '4px 0', marginTop: '0'})),
      transition('* <=> *', [animate('500ms ease-in-out')]),
      transition(':leave', style({height: '0', padding: '0 0', marginTop: '-4px'})) // Todo Make cleaning when collapsed not cancel its state
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

  suggestions = rxResource({
    request: this.searchText,
    loader: params => params.request.length >= MIN_SUGGEST_LENGTH
      ? this.http.get<string[]>(`${environment.host}/ContentService/search/suggest`, {params: {query: params.request}})
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
      if (this.scopes.local.found() === 0 && this.scopes.global.found() !== 0) this.currentScopeName.set('global')
    });
    effect(() => {
      const [active, inactive] = this.currentScopeName() === 'global'
        ? [this.scopes.global, this.scopes.local]
        : [this.scopes.local, this.scopes.global];
      active.active = true;
      inactive.active = false;
    })
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
    this.hasFocus.set(false)
    this.searchText.set(searchText);
    if (event) event.preventDefault();
    this.collapsed.set('opened')
    console.log('searching', searchText);
    this.typeFilter.set([])
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
      (page, pageSize, params) => params.diagram ?
        this.http.get<Search.Result>(`${environment.host}/ContentService/search/diagram/${params.diagram}`, {
          params: {
            ...params,
            start: page * pageSize,
            rows: pageSize,
          } as Search.Paginated<Search.Params>
        })
        : of(Search.EMPTY_RESULTS)
    ),
    global: new SearchDataSource(this.searchParams$,
      (page, pageSize, params) => this.http.get<Search.Result>(`${environment.host}/ContentService/search/fireworks/`, {
        params: {
          ...params,
          start: page * pageSize,
          rows: pageSize,
        } as Search.Paginated<Search.Params>
      })
    )
  }

  currentScope = computed(() => this.scopes[this.currentScopeName()])

  resultHeight = computed(() => {
    const [scope, ...sources] = [this.currentScopeName(), this.scopes.local.found(), this.scopes.global.found()]
    return Math.min(this.scopes[scope].found(), 10) * this.entryHeight()
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

  protected readonly has = has;
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

