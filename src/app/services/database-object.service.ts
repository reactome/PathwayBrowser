import {Injectable} from '@angular/core';
import {map, Observable, Subject} from "rxjs";
import {DatabaseObject} from "../model/graph/database-object.model";
import {JSOGDeserializer} from "../utils/JSOGDeserializer";
import {CONTENT_SERVICE} from "../../environments/environment";
import {HttpClient} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class DatabaseObjectService {


  private readonly _ENHANCED_QUERY = `${CONTENT_SERVICE}/data/query/enhanced/v2/`;
  private readonly _DATA_QUERY = `${CONTENT_SERVICE}/data/query/`;


  private _selectedObj: Subject<DatabaseObject> = new Subject<DatabaseObject>();
  public selectedObj$ = this._selectedObj.asObservable();


  constructor(private http: HttpClient) {
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
