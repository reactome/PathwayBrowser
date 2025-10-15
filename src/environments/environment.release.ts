export const environment = {
  production: true,
  host: "../..", // For go back from /beta/PathwayBrowser
  absoluteHost: "https://release.reactome.org",
  s3: "https://download.reactome.org",
  gsaServer: "dev",
  gtagId: "G-ZCVRDTGMQJ"
};

export const CONTENT_SERVICE = `${environment.host}/ContentService`;
export const ANALYSIS_SERVICE = `${environment.host}/AnalysisService`;
export const EXPERIMENT_SERVICE = `${environment.host}/experiment`;
export const RESTFUL_API = `${environment.host}/ReactomeRESTfulAPI/RESTfulWS`;
export const DOWNLOAD = `${environment.host}/download/current`;
export const OVERLAYS = `${environment.host}/overlays`;
export const CONTENT_DETAIL = `${environment.host}/content/detail`;
