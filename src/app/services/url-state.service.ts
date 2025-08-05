import {effect, Injectable, signal, WritableSignal} from '@angular/core';
import {ActivatedRoute, NavigationEnd, Params, Router} from "@angular/router";
import {catchError, combineLatestWith, filter, firstValueFrom, map, of, switchMap} from "rxjs";
import {isArray, isNumber} from "lodash";
import {HttpClient} from "@angular/common/http";
import {environment} from "../../environments/environment";
import {PaletteName} from "./analysis.service";
import {Analysis} from "../model/analysis.model";
import {UntilDestroy, untilDestroyed} from "@ngneat/until-destroy";


const FRAGMENT_PATTERN = /\/(?<id>R-[A-Z]{3}-\d+)?&?(?<params>.*)/;


export type UrlParam<T> = WritableSignal<T> & {
  otherTokens?: string[],
  initialValue: T,
  type: 'number' | 'boolean' | 'string' | 'id'
};

export function urlParam<T>(initialValue: T, type: UrlParam<T>['type'], otherTokens?: string[]): UrlParam<T> {
  const writableSignal = signal<T>(initialValue) as UrlParam<T>;
  writableSignal.otherTokens = otherTokens;
  writableSignal.initialValue = initialValue;
  writableSignal.type = type;
  return writableSignal;
}


type State = UrlStateService['values']

@UntilDestroy()
@Injectable({
  providedIn: 'root'
})
export class UrlStateService implements State {

  readonly values = {
    select: urlParam<string | null>(null, "id", ['SEL']),
    flag: urlParam<string[]>([], "id", ['FLG'],),
    path: urlParam<string[]>([], "id", ['PATH']),
    flagInteractors: urlParam<boolean>(false, "boolean", ['FLGINT']),
    overlay: urlParam<string | null>(null, "string"),
    analysis: urlParam<string | null>(null, "string", ['ANALYSIS']),
    significance: urlParam<number>(0.05, "number"),
    sample: urlParam<string | null>(null, "string"),
    palette: urlParam<PaletteName | null>(null, "string"),
    filterViewMode: urlParam<'focus' | 'overview' | undefined>(undefined, "string"),
    speciesFilter: urlParam<string[]>([], "string"),
    resourceFilter: urlParam<Analysis.Resource | null>(null, "string"),
    includeDisease: urlParam<boolean | undefined>(undefined, "boolean"),
    includeGrouping: urlParam<boolean | undefined>(undefined, "boolean"),
    pathwayMinSizeFilter: urlParam<number | undefined>(undefined, "number"),
    pathwayMaxSizeFilter: urlParam<number | undefined>(undefined, "number"),
    minExpressionFilter: urlParam<number | undefined>(undefined, "number"),
    maxExpressionFilter: urlParam<number | undefined>(undefined, "number"),
    fdrFilter: urlParam<number | undefined>(undefined, "number"),
    gsaFilter: urlParam<number[]>([], "number"),
  };

  public readonly select = this.values.select
  public readonly flag = this.values.flag
  public readonly path = this.values.path
  public readonly flagInteractors = this.values.flagInteractors
  public readonly overlay = this.values.overlay
  public readonly analysis = this.values.analysis
  public readonly significance = this.values.significance
  public readonly sample = this.values.sample
  public readonly palette = this.values.palette
  public readonly filterViewMode = this.values.filterViewMode
  public readonly speciesFilter = this.values.speciesFilter
  public readonly resourceFilter = this.values.resourceFilter
  public readonly includeDisease = this.values.includeDisease
  public readonly includeGrouping = this.values.includeGrouping
  public readonly pathwayMinSizeFilter = this.values.pathwayMinSizeFilter
  public readonly pathwayMaxSizeFilter = this.values.pathwayMaxSizeFilter
  public readonly minExpressionFilter = this.values.minExpressionFilter
  public readonly maxExpressionFilter = this.values.maxExpressionFilter
  public readonly fdrFilter = this.values.fdrFilter
  public readonly gsaFilter = this.values.gsaFilter

  public readonly pathwayId = signal<string | undefined>(undefined);


  constructor(route: ActivatedRoute, private router: Router, private http: HttpClient) {

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      switchMap(() => this.router.routerState.root.firstChild?.params || of()),
      map(params => params['pathwayId'])
    ).subscribe((id) => {
      this.pathwayId.set(id)
    });

    effect(() => {
      console.log('Updating patwhayId to ', this.pathwayId())
      this.router.navigate(this.pathwayId() ? [this.pathwayId()] : [], {
        queryParamsHandling: 'preserve',
        preserveFragment: true
      });
    });

    route.fragment.pipe(untilDestroyed(this)).subscribe((fragment) => {
      if (fragment) { // Convert fragments to params
        let params: Params = {};
        let id = undefined; // Default routing

        const match = fragment.match(FRAGMENT_PATTERN);
        if (match && match.groups) {
          if (match.groups['id']) {
            id = match.groups['id'];
          }
          if (match.groups['params']) {
            match.groups['params']
              .split("&")
              .map(param => param.split("="))
              .forEach(([key, value]) => {
                params[key] = value || true;
              })
          }
        }

        this.router.navigate(id ? [id] : [], {
          queryParamsHandling: 'merge',
          fragment: fragment.replace(FRAGMENT_PATTERN, ''),
          preserveFragment: false,
          queryParams: params
        });
      }
    })

    route.queryParams.pipe(untilDestroyed(this)).subscribe(async (params) => {
      for (const mainToken in this.values) {
        const param = this.values[mainToken as keyof State] as UrlParam<any>;
        const tokens: string[] = [mainToken, ...param.otherTokens || []];
        const token = tokens.find(token => params[token] !== undefined);
        if (token) {
          const initialValue = param.initialValue;
          let value = params[token];
          if (value === undefined || value === null) param.set(value);
          else {
            if (isArray(initialValue)) {
              let values: any[] = value.split(';');
              if (param.type === 'id') {
                const mixedValues = values.map(v => v.charAt(0).match(/\d/) ? parseInt(v) : v);
                values = await Promise.all(mixedValues.map(v => this.ensureStId(v)));
              }
              if (param.type === 'number') values = values.map(v => +v);
              if (param.type === 'boolean') values = values.map(v => v === 'true');
              param.set(values);
            } else if (param.type === 'boolean') {
              param.set(value === 'true');
            } else if (param.type === 'id') {
              param.set(!isNaN(+value) ? await this.dbIdToStId(+value) : value)
            } else if (param.type === 'number') {
              param.set(parseFloat(value))
            } else {
              param.set(value.replaceAll('__', ' '))
            }
          }
        } else {
          param.set(param.initialValue)
        }
      }
    })
    effect(() => {
      const queryParams = {} as any;
      for (const key in this.values) {
        let param = this.values[key as keyof State];
        let paramValue = param();
        if (paramValue === undefined
          || paramValue === null
          || (isArray(paramValue) && paramValue.length === 0)
          || paramValue === param.initialValue
        ) continue;
        if (typeof paramValue === 'string') paramValue = paramValue.replaceAll(' ', '__')
        queryParams[key] = isArray(paramValue) ? paramValue.join(';') : paramValue;
      }
      console.log('Updating URL from state', queryParams)
      this.router.navigate([], {queryParams, preserveFragment: true});
    });
  }

  async ensureStId(id: string | number): Promise<string> {
    return isNumber(id) ? this.dbIdToStId(id) : id;
  }

  async dbIdToStId(dbId: number): Promise<string> {
    return firstValueFrom(this.http.get(`${environment.host}/ContentService/data/query/${dbId}/stId`, {responseType: "text"}).pipe(
      catchError(() => of(dbId + '')))
    );
  }

}
