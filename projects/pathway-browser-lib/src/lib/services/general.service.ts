import {computed, Injectable, resource} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {rxResource} from "@angular/core/rxjs-interop";
import {PathwayBrowserConfigService} from "./pathway-browser-config.service";

@Injectable({
  providedIn: 'root'
})
export class GeneralService {

  constructor(private http: HttpClient, private config: PathwayBrowserConfigService) { }

  version = rxResource({
    request: () => true,
    loader: () => this.http.get<number>(`${this.config.CONTENT_SERVICE}/data/database/version`)
  })

  download = computed(() => this.config.preferS3 && this.version.value() ? `${this.config.s3}/${this.version.value()}` : this.config.DOWNLOAD)
}
