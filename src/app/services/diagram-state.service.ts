import {effect, Injectable, model, signal} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {BehaviorSubject, distinctUntilChanged, filter, firstValueFrom, map, Observable, tap} from "rxjs";
import {isArray, isBoolean, isNumber} from "lodash";
import {HttpClient} from "@angular/common/http";
import {environment} from "../../environments/environment";
import {toSignal} from "@angular/core/rxjs-interop";
import {isDefined} from "./utils";


export interface UrlParam<T> {
  value: T
  otherTokens?: string[]
}

export type State = {
  [token: string]: UrlParam<any>
  select: UrlParam<string>
  flag: UrlParam<string[]>
  path: UrlParam<string[]>
  flagInteractors: UrlParam<boolean>
  overlay: UrlParam<string | null>
  analysis: UrlParam<string | null>
  analysisProfile: UrlParam<string | null>
};

type ObservableState = { [K in keyof State as `${K & string}$`]: Observable<State[K]['value']> };

@Injectable({
  providedIn: 'root'
})
export class DiagramStateService {

  private propagate = false;

  diagramId = signal<string | undefined>(undefined)

  private state: State = {
    select: {otherTokens: ['SEL'], value: ''},
    flag: {otherTokens: ['FLG'], value: []},
    path: {otherTokens: ['PATH'], value: []},
    flagInteractors: {otherTokens: ['FLGINT'], value: false},
    overlay: {value: ''},
    analysis: {value: null, otherTokens: ['ANALYSIS']},
    analysisProfile: {value: null},
  };

  private _state$ = new BehaviorSubject<State>(this.state);
  public state$ = this._state$.asObservable();
  public onChange: ObservableState = Object.keys(this.state)
    .reduce((properties, prop: keyof State) => {
      properties[`${prop}$`] = this.state$.pipe(
        map(state => state[prop].value),
        distinctUntilChanged((v1, v2) => v1?.toString() === v2?.toString()),
        tap(v => console.log(`${prop} has been updated to ${v}`)),
        // share()
      )
      return properties;
    }, {} as ObservableState);

  constructor(private route: ActivatedRoute, private router: Router, private http: HttpClient) {
    effect(() => {
      if (this.diagramId()) this.router.navigate([this.diagramId()], {
        queryParamsHandling: 'preserve',
        preserveFragment: true
      })
    });
    this.route.paramMap.pipe(
      map(params => params.get('id')),
      filter(isDefined)
    ).subscribe((id) => this.diagramId.set(id))

    route.queryParamMap.subscribe(async params => {
      for (const mainToken in this.state) {
        const param = this.state[mainToken];
        const tokens: string[] = [mainToken, ...param.otherTokens || []];
        const token = tokens.find(token => params.has(token));
        if (token) {
          const formerValue = param.value;
          let value = params.get(token)!;
          if (isArray(param.value)) {
            const rawValue = value!;
            param.value = rawValue.split(',').map(v => v.charAt(0).match(/\d/) ? parseInt(v) : v);
            const hasDbIds = param.value.some(isNumber);
            if (hasDbIds) {
              param.value = await Promise.all(param.value.map((v: string | number) => this.ensureStId(v)));
              this.set(mainToken, param.value);
            }
          } else if (isBoolean(param.value)) {
            param.value = value === 'true';
          } else if (value.charAt(0).match(/\d/)) {
            this.set(mainToken, await this.dbIdToStId(parseInt(value)))
          } else {
            param.value = value
          }
        }
      }
      if (this.propagate) this._state$.next(this.state);
    })
  }

  async ensureStId(id: string | number): Promise<string> {
    return isNumber(id) ? this.dbIdToStId(id) : id;
  }

  async dbIdToStId(dbId: number): Promise<string> {
    return firstValueFrom(this.http.get(`${environment.host}/ContentService/data/query/${dbId}/stId`, {responseType: "text"}))
  }

  get<T extends keyof State>(token: T): State[T]['value'] {
    return this.state[token].value
  }

  set<T extends keyof State>(token: T, value: State[T]["value"], propagate = true): void {
    this.state[token].value = value;
    this.propagate = propagate;
    this.onPropertyModified();
  }

  // TODO make unselect remove select from state
  onPropertyModified() {
    return this.router.navigate([], {
      queryParams: {
        ...Object.entries(this.state)
          .filter(([token, param]) => param.value && param.value.length !== 0)
          .reduce((acc, [token, param]) => ({
            ...acc,
            [token]: Array.isArray(param.value) ? param.value.join(',') : param.value
          }), {})
      }
    })
  }


}
