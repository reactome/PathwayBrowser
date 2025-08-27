import {Injectable} from '@angular/core';
import {CONTENT_SERVICE} from "../../environments/environment";
import {HttpClient} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class GeneralService {

  constructor(private http: HttpClient) { }

  version$ = this.http.get<number>(`${CONTENT_SERVICE}/data/database/version`);
}
