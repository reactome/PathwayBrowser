export const environment = {
  production: false,
  host: "https://dev.reactome.org",
  s3: "https://s3.amazonaws.com/download.reactome.org",
  gsaServer: "dev"
};

export const CONTENT_SERVICE = `${environment.host}/ContentService`;
export const ANALYSIS_SERVICE = `${environment.host}/AnalysisService`;
export const EXPERIMENT_SERVICE = `${environment.host}/experiment`;
export const RESTFUL_API = `${environment.host}/ReactomeRESTfulAPI/RESTfulWS`;
export const DOWNLOAD = `${environment.host}/download/current`;
export const OVERLAYS = `${environment.host}/overlays`;
