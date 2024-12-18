export interface SearchResult {
  results: Result[];
}

export interface Result {
  entries: Entry[];
  typeName: string
}



export interface Entry {
  stId: string;
  iconReferences: string[];
  exactType: string;
}
