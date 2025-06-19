import {effect, Injectable, signal, WritableSignal} from '@angular/core';
import {ActivatedRoute, NavigationEnd, Router} from "@angular/router";
import {catchError, filter, firstValueFrom, map, of, switchMap} from "rxjs";
import {isArray, isBoolean, isNumber} from "lodash";
import {HttpClient} from "@angular/common/http";
import {environment} from "../../environments/environment";
import {PaletteName} from "./analysis.service";
import {Analysis} from "../model/analysis.model";


export type UrlParam<T> = WritableSignal<T> & { otherTokens?: string[], initialValue: T, containsId: boolean};

export function urlParam<T>(initialValue: T, otherTokens?: string[], containsId = false): UrlParam<T> {
  const writableSignal = signal<T>(initialValue) as UrlParam<T>;
  writableSignal.otherTokens = otherTokens;
  writableSignal.initialValue = initialValue;
  writableSignal.containsId = containsId;
  return writableSignal;
}


type State = UrlStateService['values']

@Injectable({
  providedIn: 'root'
})
export class UrlStateService implements State {

  readonly values = {
    select: urlParam<string | null>(null, ['SEL'], true),
    flag: urlParam<string[]>([], ['FLG'], true),
    path: urlParam<string[]>([], ['PATH'], true),
    flagInteractors: urlParam<boolean>(false, ['FLGINT']),
    overlay: urlParam<string | null>(null),
    analysis: urlParam<string | null>(null, ['ANALYSIS']),
    sample: urlParam<string | null>(null),
    palette: urlParam<PaletteName | null>(null),
    speciesFilter: urlParam<string[]>([]),
    resourceFilter: urlParam<Analysis.Resource | null>(null),
    notDiseaseFilter: urlParam<boolean>(false),
    groupingFilter: urlParam<boolean>(false),
    pathwayMinSizeFilter: urlParam<number | undefined>(undefined),
    pathwayMaxSizeFilter: urlParam<number | undefined>(undefined),
    pValueFilter: urlParam<number | undefined>(undefined),
  };

  public readonly select = this.values.select
  public readonly flag = this.values.flag
  public readonly path = this.values.path
  public readonly flagInteractors = this.values.flagInteractors
  public readonly overlay = this.values.overlay
  public readonly analysis = this.values.analysis
  public readonly sample = this.values.sample
  public readonly palette = this.values.palette
  public readonly speciesFilter = this.values.speciesFilter
  public readonly resourceFilter = this.values.resourceFilter
  public readonly notDiseaseFilter = this.values.notDiseaseFilter
  public readonly groupingFilter = this.values.groupingFilter
  public readonly pathwayMinSizeFilter = this.values.pathwayMinSizeFilter
  public readonly pathwayMaxSizeFilter = this.values.pathwayMaxSizeFilter
  public readonly pValueFilter = this.values.pValueFilter

  public readonly pathwayId = signal<string | undefined>(undefined);


  constructor(route: ActivatedRoute, private router: Router, private http: HttpClient) {

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      switchMap(() => this.router.routerState.root.firstChild?.params || of()),
      map( params  => params['pathwayId'])
    ).subscribe((id) => {
      this.pathwayId.set(id)
    });

    effect(() => {
      console.log('Updating patwhayId to ',  this.pathwayId())
      this.router.navigate(this.pathwayId() ? [this.pathwayId()] : [], {queryParamsHandling:'preserve', preserveFragment: true});
    });


    route.queryParamMap.subscribe(async params => {
      for (const mainToken in this.values) {
        const param = this.values[mainToken as keyof State] as UrlParam<any>;
        const tokens: string[] = [mainToken, ...param.otherTokens || []];
        const token = tokens.find(token => params.has(token));
        if (token) {
          const initialValue = param.initialValue;
          let value = params.get(token)!;
          if (isArray(initialValue)) {
            let values = value.split(',');
            if (param.containsId) {
              const mixedValues = values.map(v => v.charAt(0).match(/\d/) ? parseInt(v) : v);
              values = await Promise.all(mixedValues.map(v => this.ensureStId(v)));
            }
            param.set(values);
          } else if (isBoolean(initialValue)) {
            param.set(value === 'true');
          } else if (!isNaN(+value)) {
            param.set(param.containsId ? await this.dbIdToStId(+value) : parseFloat(value) )
          } else {
            param.set(value.replaceAll('__', ' '))
          }
        } else {
          param.set(param.initialValue)
        }
      }
    })
    effect(() => {
      const queryParams = {} as any;
      for (const key in this.values) {
        let param = this.values[key as keyof State]();
        if (!param || (isArray(param) && param.length === 0)) continue;
        if (typeof param === 'string') param = param.replaceAll(' ', '__')
        queryParams[key] = isArray(param) ? param.join(',') : param;
      }
      console.log('Updating URL from state', queryParams)
      this.router.navigate([], {queryParams});
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
