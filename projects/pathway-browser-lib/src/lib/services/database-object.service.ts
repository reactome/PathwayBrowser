import {Injectable} from '@angular/core';
import {map, Observable, Subject} from "rxjs";
import {DatabaseObject} from "../model/graph/database-object.model";
import {JSOGDeserializer} from "../utils/JSOGDeserializer";
import {HttpClient} from "@angular/common/http";
import {PathwayBrowserConfigService} from "./pathway-browser-config.service";

@Injectable({
  providedIn: 'root'
})
export class DatabaseObjectService {


  private _ENHANCED_QUERY!: string;
  private _DATA_QUERY!: string;


  private _selectedObj: Subject<DatabaseObject> = new Subject<DatabaseObject>();
  public selectedObj$ = this._selectedObj.asObservable();


  constructor(private http: HttpClient, private config: PathwayBrowserConfigService) {
    this._ENHANCED_QUERY = `${this.config.CONTENT_SERVICE}/data/query/enhanced/v2/`;
    this._DATA_QUERY = `${this.config.CONTENT_SERVICE}/data/query/`;
  }


  setCurrentObj(obj: DatabaseObject) {
    this._selectedObj.next(obj);
  }

  fetchEnhancedEntry<T extends DatabaseObject>(stId: string, summariseReferenceEntity = false): Observable<T> {
    let url = `${this._ENHANCED_QUERY}${stId}`;
    return this.http.get<T>(url, {
      params: {
        includeRef: true,
        view: 'nested-aggregated',
        summariseReferenceEntity,
        includeDisease: true,
      }
    }).pipe(
      map((response: T) => {
        const deserializer = new JSOGDeserializer();
        const resolvedResponse = deserializer.deserialize(response);
        return resolvedResponse as unknown as T;
      })
    )
  }


  fetchSimpleData<T extends DatabaseObject>(stId: string): Observable<T> {
    let url = `${this._DATA_QUERY}${stId}`;
    return this.http.get<T>(url).pipe(
      map((response: T) => {
        const deserializer = new JSOGDeserializer();
        const resolvedResponse = deserializer.deserialize(response);
        return resolvedResponse as unknown as T;
      })
    )
  }

}
