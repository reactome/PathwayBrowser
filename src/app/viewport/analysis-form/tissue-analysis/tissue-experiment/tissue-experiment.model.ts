export namespace TissueExperiment {

  export interface Summaries {
    summaries: Summary[];
  }

  export interface Summary {
    id: number;
    name: string;
    description: string;
    resource: string;
    url: string;
    timestamp: string;
    numberOfGenes: number;
    tissuesMap: Record<string, number>;
  }

  export interface SampleParams extends Record<string, any> {
    omitNulls?: boolean;
    included: number[]
  }
}

