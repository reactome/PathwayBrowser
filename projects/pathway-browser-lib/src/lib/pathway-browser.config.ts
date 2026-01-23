import {InjectionToken} from '@angular/core';

export interface PathwayBrowserConfig {
  production: boolean;
  host: string;
  s3: string;
  gsaServer: string;
  gtagId: string;
  preferS3: boolean;
}

export const PATHWAY_BROWSER_CONFIG = new InjectionToken<PathwayBrowserConfig>('PathwayBrowserConfig');

// Helper functions to derive service URLs from config
export function getContentService(config: PathwayBrowserConfig): string {
  return `${config.host}/ContentService`;
}

export function getAnalysisService(config: PathwayBrowserConfig): string {
  return `${config.host}/AnalysisService`;
}

export function getExperimentService(config: PathwayBrowserConfig): string {
  return `${config.host}/experiment`;
}

export function getRestfulApi(config: PathwayBrowserConfig): string {
  return `${config.host}/ReactomeRESTfulAPI/RESTfulWS`;
}

export function getDownload(config: PathwayBrowserConfig): string {
  return `${config.host}/download/current`;
}

export function getOverlays(config: PathwayBrowserConfig): string {
  return `${config.host}/overlays`;
}

export function getContentDetail(config: PathwayBrowserConfig): string {
  return `${config.host}/content/detail`;
}

export function getContentQuery(config: PathwayBrowserConfig): string {
  return `${config.host}/content/query`;
}
