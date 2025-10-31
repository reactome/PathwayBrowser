import {computed, Injectable, resource} from '@angular/core';
import {CONTENT_SERVICE, DOWNLOAD, environment} from "../../environments/environment";
import {HttpClient} from "@angular/common/http";
import {rxResource} from "@angular/core/rxjs-interop";

@Injectable({
  providedIn: 'root'
})
export class GeneralService {

  constructor(private http: HttpClient) { }

  version = rxResource({
    request: () => true,
    loader: () => this.http.get<number>(`${CONTENT_SERVICE}/data/database/version`)
  })

  download = computed(() => environment.preferS3 && this.version.value() ? `${environment.s3}/${this.version.value()}` : DOWNLOAD)
}
