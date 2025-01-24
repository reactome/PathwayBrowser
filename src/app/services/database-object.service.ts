import { Injectable } from '@angular/core';
import {map, Observable, Subject} from "rxjs";
import {Event} from "../model/graph/event.model";
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




  fetchEnhancedEntry(stId: string): Observable<DatabaseObject> {
    let url = `${this._ENHANCED_QUERY}${stId}?includeRef=true`;
    return this.http.get<DatabaseObject>(url).pipe(
      map((response: DatabaseObject) => {
        const deserializer = new JSOGDeserializer();
        const resolvedResponse = deserializer.deserialize(response);
        return resolvedResponse as unknown as DatabaseObject;
      })
    )
  }


  fetchEventData(stId: string): Observable<DatabaseObject> {
    let url = `${this._DATA_QUERY}${stId}`;
    return this.http.get<Event>(url).pipe(
      map((response: Event) => {
        const deserializer = new JSOGDeserializer();
        const resolvedResponse = deserializer.deserialize(response);
        return resolvedResponse as unknown as Event;
      })
    )
  }

}
