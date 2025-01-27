import {Injectable} from '@angular/core';
import {map, Observable, Subject} from "rxjs";
import {DatabaseObject} from "../model/graph/database-object.model";
import {JSOGDeserializer} from "../utils/JSOGDeserializer";
import {environment} from "../../environments/environment";
import {HttpClient} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class DatabaseObjectService {


  private readonly _ENHANCED_QUERY = `${environment.host}/ContentService/data/query/enhanced/`;
  private readonly _DATA_QUERY = `${environment.host}/ContentService/data/query/`;


  private _selectedObj: Subject<DatabaseObject> = new Subject<DatabaseObject>();
  public selectedObj$ = this._selectedObj.asObservable();


  constructor(private http: HttpClient) { }


  setCurrentObj(obj: DatabaseObject) {
    this._selectedObj.next(obj);
  }

  fetchEnhancedEntry<T extends DatabaseObject>(stId: string): Observable<T> {
    let url = `${this._ENHANCED_QUERY}${stId}?includeRef=true`;
    return this.http.get<T>(url).pipe(
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
