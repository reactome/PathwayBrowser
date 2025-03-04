export namespace Analysis {
  export type SortBy = 'NAME' |
    'TOTAL_ENTITIES' | 'TOTAL_INTERACTORS' | 'TOTAL_REACTIONS' |
    'FOUND_ENTITIES' | 'FOUND_INTERACTORS' | 'FOUND_REACTIONS' |
    'ENTITIES_RATIO' | 'ENTITIES_PVALUE' | 'ENTITIES_FDR' |
    'REACTION_RATIO';

  export type Resource =
    'TOTAL'
    | 'UNIPROT'
    | 'ENSEMBL'
    | 'CHEBI'
    | 'IUPHAR'
    | 'MIRBASE'
    | 'NCBI_PROTEIN'
    | 'EMBL'
    | 'COMPOUND'
    | 'PUBCHEM_COMPOUND';

  export interface Parameters {
    /**
     * Include interactors.
     *
     * Default: false
     */
    interactors?: boolean;
    /**
     * list of species to filter the result (accepts taxonomy ids, species names and dbId).
     *
     * Default: empty
     */
    species?: string;
    /**
     * pathways per page.
     *
     * Default: 20
     */
    pageSize?: number;
    /**
     * page number.
     *
     * Default: 1
     */
    page?: number;
    /**
     * Default: 'ENTITIES_FDR'
     */
    sortBy?: SortBy;
    /**
     * Default: 'ASC'
     */
    order?: 'ASC' | 'DESC';
    /**
     * Default: TOTAL
     */
    resource?: Resource;
    /**
     * defines the pValue threshold. Only hit pathway with pValue equals or below the threshold will be returned.
     *
     * Default: 0.05
     */
    pValue?: number;
    /**
     * set to 'false' to exclude the disease pathways from the result (it does not alter the statistics)
     *
     * Default: true
     */
    includeDisease?: boolean;
    /**
     * minimum number of contained entities per pathway (takes into account the resource)
     *
     * Default: empty
     */
    min?: number;
    /**
     * maximum number of contained entities per pathway (takes into account the resource)
     *
     * Default: empty
     */
    max?: number;
    /**
     * Filters resources to only includes importable ones
     *
     * Default: false
     */
    importableOnly?: boolean;
  }

  export interface Pathway  {
    dbId: number,
    stId: string,
    name: string,
    llp: boolean,
    inDisease: boolean,
    entities: {
      resource: Resource,
      total: number,
      found: number,
      ratio: number,
      pValue: number,
      fdr: number,
      exp: number[],
      curatedFound?: number,
      curatedTotal?: number,
    }
    reactions: {
      resource: Resource,
      total: number,
      found: number,
      ratio: number,
    },
    species: {
      dbId: number,
      taxId: string,
      name: string
    }
  }

  export type Type = 'OVERREPRESENTATION' | 'EXPRESSION' | 'GSA_REGULATION';

  export interface Result {
    expression: {
      columnNames: string[],
      min: number
      max: number,
    },
    identifiersNotFound: number,
    pathwaysFound: number,
    warnings?: string[],
    pathways: Pathway[];

    resourceSummary: {
      resource: Resource,
      pathways: number,
      filtered: number
    }[];

    speciesSummary: {
      dbId: number,
      taxId: string,
      name: string,
      pathways: number,
      filtered: number,
    }[];

    summary: {
      token: string,
      type: Type | string,
      sampleName: string,
      text: boolean,
      projection: boolean,
      interactors: boolean,
      includeDisease: boolean,

      species?: number,
      fileName?: string,
      gsaMethod?: string,
      gsaToken?: string,
    }

  }

  type Identifiers = {
    ids: string[],
    resource: Resource
  };

  export interface FoundEntities {
    pathway: string,
    foundEntities: number,
    foundInteractors: number,

    expNames: string[],
    resources: Resource[]
    entities: {
      id: string,
      mapsTo: Identifiers[],
      exp: number[]
    }[],
    interactors?: {
      id: string,
      interactsWith: Identifiers[],
      mapsTo: string[],
      exp: number[]
    }[]
  }
}
