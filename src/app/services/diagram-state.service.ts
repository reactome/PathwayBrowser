import {effect, Injectable, signal, WritableSignal} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {firstValueFrom} from "rxjs";
import {isArray, isBoolean, isNumber} from "lodash";
import {HttpClient, HttpParams} from "@angular/common/http";
import {environment} from "../../environments/environment";


type UrlParam<T> = WritableSignal<T> & { otherTokens?: string[], initialValue: T };

export function urlParam<T>(initialValue: T, otherTokens?: string[]): UrlParam<T> {
  const writableSignal = signal<T>(initialValue) as UrlParam<T>;
  writableSignal.otherTokens = otherTokens;
  writableSignal.initialValue = initialValue;
  return writableSignal;
}


type State = DiagramStateService['values']

@Injectable({
  providedIn: 'root'
})
export class DiagramStateService implements State {

  private readonly values = {
    select: urlParam<string>('', ['SEL']),
    flag: urlParam<string[]>([], ['FLG']),
    path: urlParam<string[]>([], ['PATH']),
    flagInteractors: urlParam<boolean>(false, ['FLGINT']),
    overlay: urlParam<string | null>(''),
    analysis: urlParam<string | null>(null, ['ANALYSIS']),
    analysisProfile: urlParam<string | null>(null),
  };

  public readonly select = this.values.select
  public readonly flag = this.values.flag
  public readonly path = this.values.path
  public readonly flagInteractors = this.values.flagInteractors
  public readonly overlay = this.values.overlay
  public readonly analysis = this.values.analysis
  public readonly analysisProfile = this.values.analysisProfile


  constructor(route: ActivatedRoute, private router: Router, private http: HttpClient) {
    route.queryParamMap.subscribe(async params => {
      for (const mainToken in this.values) {
        const param = this.values[mainToken as keyof State] as UrlParam<any>;
        const tokens: string[] = [mainToken, ...param.otherTokens || []];
        const token = tokens.find(token => params.has(token));
        if (token) {
          const formerValue = param();
          let value = params.get(token)!;
          if (isArray(formerValue)) {
            let values = value.split(',').map(v => v.charAt(0).match(/\d/) ? parseInt(v) : v);
            if (values.some(isNumber)) {
              values = await Promise.all(values.map((v: string | number) => this.ensureStId(v)));
            }
            param.set(values);
          } else if (isBoolean(formerValue)) {
            param.set(value === 'true');
          } else if (value.charAt(0).match(/\d/)) {
            param.set(await this.dbIdToStId(parseInt(value)))
          } else {
            param.set(value)
          }
        }
      }
    })
    effect(() => {
      const queryParams = {} as any;
      for (const key in this.values) {
        let param = this.values[key as keyof State]();
        if (!param || (isArray(param) && param.length === 0)) continue;
        queryParams[key] = isArray(param) ? param.join(',') : param;
      }
      console.log(queryParams)
      this.router.navigate([], {queryParams});
    });
  }

  async ensureStId(id: string | number): Promise<string> {
    return isNumber(id) ? this.dbIdToStId(id) : id;
  }

  async dbIdToStId(dbId: number): Promise<string> {
    return firstValueFrom(this.http.get(`${environment.host}/ContentService/data/query/${dbId}/stId`, {responseType: "text"}))
  }

}
