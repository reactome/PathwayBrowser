import {Inject, Injectable} from '@angular/core';
import {PATHWAY_BROWSER_CONFIG, PathwayBrowserConfig} from '../pathway-browser.config';

@Injectable({
  providedIn: 'root'
})
export class PathwayBrowserConfigService {
  readonly production: boolean;
  readonly host: string;
  readonly s3: string;
  readonly gsaServer: string;
  readonly gtagId: string;
  readonly preferS3: boolean;

  // Derived service URLs
  readonly CONTENT_SERVICE: string;
  readonly ANALYSIS_SERVICE: string;
  readonly EXPERIMENT_SERVICE: string;
  readonly RESTFUL_API: string;
  readonly DOWNLOAD: string;
  readonly OVERLAYS: string;
  readonly CONTENT_DETAIL: string;
  readonly CONTENT_QUERY: string;

  constructor(@Inject(PATHWAY_BROWSER_CONFIG) config: PathwayBrowserConfig) {
    this.production = config.production;
    this.host = config.host;
    this.s3 = config.s3;
    this.gsaServer = config.gsaServer;
    this.gtagId = config.gtagId;
    this.preferS3 = config.preferS3;

    // Derive service URLs
    this.CONTENT_SERVICE = `${config.host}/ContentService`;
    this.ANALYSIS_SERVICE = `${config.host}/AnalysisService`;
    this.EXPERIMENT_SERVICE = `${config.host}/experiment`;
    this.RESTFUL_API = `${config.host}/ReactomeRESTfulAPI/RESTfulWS`;
    this.DOWNLOAD = `${config.host}/download/current`;
    this.OVERLAYS = `${config.host}/overlays`;
    this.CONTENT_DETAIL = `${config.host}/content/detail`;
    this.CONTENT_QUERY = `${config.host}/content/query`;
  }
}
