import {Injectable, ResourceRef} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {TissueExperiment} from "./tissue-experiment.model";
import {Observable} from "rxjs";
import {environment} from "../../../../../environments/environment";
import {rxResource} from "@angular/core/rxjs-interop";

@Injectable({
  providedIn: 'root'
})
export class TissueExperimentService {
  constructor(private http: HttpClient) {
  }

  summaries = rxResource({
    request: () => ({}),
    loader: () => this.getExperimentsSummary()
  })

  getExperimentsSummary(): Observable<TissueExperiment.Summaries> {
    return this.http.get<TissueExperiment.Summaries>(`/ExperimentDigester/experiments/summaries`);
  }

  getSampleURL(id: number, {omitNulls, columns}: { omitNulls: boolean, columns: number[] } ): string {
    return `https://127.0.0.1/ExperimentDigester/experiments/${id}/sample?omitNulls=${omitNulls}&${columns.map(c => `included=${c}`).join('&')}`;
  }

  /**
   * Should not be used as we let the backend handle the download and analysis using the URL
   * @param id
   * @param omitNulls
   * @param columns
   */
  getSample(id: number, {omitNulls, columns}: { omitNulls: boolean, columns: number[] }): Observable<string> {
    const params: TissueExperiment.SampleParams = {
      omitNulls,
      included: columns
    };
    return this.http.get(`${environment.host}/experiments/${id}/sample`, {
      responseType: "text", params
    });
  }
}
