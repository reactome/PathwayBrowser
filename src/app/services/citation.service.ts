import {computed, effect, inject, Injectable, Signal, signal} from '@angular/core';
import {Observable} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {environment} from "../../environments/environment";
import {isPathway} from "./utils";
import {DataStateService} from "./data-state.service";
import {AnalysisService} from "./analysis.service";
import {rxResource} from "@angular/core/rxjs-interop";
import {CitationComponent} from "../citation/citation.component";
import {MatDialog} from "@angular/material/dialog";


interface PathwayCitation {
  imageCitation: string;
  pathwayCitation: string;
}

export enum StaticCitation {
  PATHWAY_ANALYSIS_CITATION_ID = "28249561",
  PATHWAY_GSA_ANALYSIS_CITATION_ID = "32907876",
  DIAGRAM_VIEWER_CITATION_ID = "29186351",
  REACTOME_KNOWLEDGEBASE_ID = "37941124"
}


export type Citation = {
  id: Signal<string>;
  content: Signal<string | PathwayCitation>;
  downloadItems: Signal<DownloadUrl[]>
}

export type DownloadUrl = {
  url: string;
  format: string
}

export enum ExportFormat {
  BIB = 'bib',
  RIS = 'ris',
  TXT = 'txt'
}

@Injectable({
  providedIn: 'root'
})
export class CitationService {

  readonly dialog = inject(MatDialog);

  currentCitationId = signal<string | undefined>(undefined);
  currentDate = new Date().toDateString();

  constructor(private http: HttpClient,
              private dataState: DataStateService,
              private analysis: AnalysisService,) {

    effect(() => {
      this.currentCitationId.set(this.updatedCitationId())
    });
  }

  updatedCitationId() {
    // If pathway detail is available
    if (this.dataState.hasDetail()) {
      const pathway = this.dataState.currentPathway();
      if (pathway) return pathway.stId;

      const selected = this.dataState.selectedElement();
      if (selected && isPathway(selected)) return selected.stId;

      // Fallback for  no pathway/selection
      return StaticCitation.REACTOME_KNOWLEDGEBASE_ID;
    }
    // If analysis results exist
    if (this.analysis.result()) {
      return this.analysis.isGSA() ? StaticCitation.PATHWAY_GSA_ANALYSIS_CITATION_ID : StaticCitation.PATHWAY_ANALYSIS_CITATION_ID;
    }

    // No detail, no analysis
    return StaticCitation.DIAGRAM_VIEWER_CITATION_ID;
  };

  isStatic = computed(() => {
    const id = this.updatedCitationId();
    if (!id) return false;
    return /^\d+$/.test(id);  // is only digits
  })


  citationData = rxResource({
    request: () => {
      const id = this.updatedCitationId();
      return id ?? undefined;
    },
    loader: (params) => this.getCitation(params.request)
  })

  getCitation(id: string): Observable<string | PathwayCitation> {
    const staticUrl = `${environment.host}/ContentService/citation/static/${id}`;
    const pathwayUrl = `${environment.host}/ContentService/citation/pathway/${id}?dateAccessed=${this.currentDate}`;
    return this.isStatic() ? this.http.get(`${staticUrl}`, {responseType: 'text'}) : this.http.get<PathwayCitation>(`${pathwayUrl}`)
  }

  openDialog() {
    const citation = this.citationData.value();
    const id = this.currentCitationId();
    if (citation && id) {
      const dialogRef = this.dialog.open(CitationComponent, {
        data: {
          content: this.citationData.value,
          id: this.currentCitationId(),
          downloadItems: signal(this.getExportUrls(id))
        }
      });
      dialogRef.afterClosed();
    }
  }

  getExportUrls(id: string) {
    const urls: DownloadUrl[] = [];
    const isPathway = !this.isStatic();
    const formats = Object.values(ExportFormat)
    let url: DownloadUrl;
    for (const format of formats) {
      const link = `${environment.host}/ContentService/citation/export?id=${id}&ext=${format}&isPathway=${isPathway}&dateAccessed=${this.currentDate}`;
      url = {url: link, format: format};
      urls.push(url);
    }
    return urls;
  }

  isPathwayCitation(obj: string | PathwayCitation): obj is PathwayCitation {
    return (typeof obj === 'object' && obj !== null && 'imageCitation' in obj && 'pathwayCitation' in obj);
  }
}
