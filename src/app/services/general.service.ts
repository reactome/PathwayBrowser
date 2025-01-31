import {Injectable} from '@angular/core';
import {environment} from "../../environments/environment";
import {HttpClient} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class GeneralService {

  private readonly versionURL = `${environment.host}/ContentService/data/database/version`;

  constructor(private http: HttpClient) { }

  version$ = this.http.get<number>(this.versionURL);
}
