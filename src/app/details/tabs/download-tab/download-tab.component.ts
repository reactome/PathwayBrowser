import {Component, computed, signal, Signal, WritableSignal} from '@angular/core';
import {UrlStateService} from "../../../services/url-state.service";
import {HttpClient} from "@angular/common/http";
import {DataStateService} from "../../../services/data-state.service";
import {isPathway} from "../../../services/utils";
import {AnalysisService} from "../../../services/analysis.service";
import {ANALYSIS_SERVICE, CONTENT_SERVICE, RESTFUL_API} from "../../../../environments/environment";
import {toSignal} from "@angular/core/rxjs-interop";
import {SafePipe} from "../../../pipes/safe.pipe";
import {MatTooltip} from "@angular/material/tooltip";
import {MatProgressSpinner} from "@angular/material/progress-spinner";
import {EhldService} from "../../../services/ehld.service";
import {DownloadFormat, DownloadService, DownloadTarget} from "../../../services/download.service";
import {DownloadButtonComponent} from "./download-button/download-button.component";


type PathwayItem = {
  name: string;
  url: Signal<string>;
  fileName?: Signal<string> | undefined;
}

type AnaLysisItem = {
  title: string;
  description?: string;
  url: Signal<string>;
  icon: string;
  isShown: Signal<boolean>;
}

type DiagramItem = {
  format: string;
  icon?: string;
  url?: Signal<string>;
  method?: () => void
  hasEHLD?: Signal<boolean>
  download?: boolean
}


@Component({
  selector: 'cr-download-tab',
  imports: [
    SafePipe,
    MatTooltip,
    MatProgressSpinner,
    DownloadButtonComponent,

  ],
  templateUrl: './download-tab.component.html',
  styleUrl: './download-tab.component.scss'
})
export class DownloadTabComponent {

  newtIcon = toSignal(this.http.get('assets/icons/download/newt.svg', {responseType: 'text'}), {initialValue: ''});
  newtUrl = computed(() => `https://web.newteditor.org/?URL=${CONTENT_SERVICE}/exporter/event/${this.finalEventId()}.sbgn&inferNestingOnLoad=true&mapColorScheme=opposed_red_blue&fitLabelsToNodes=true`)

  pathwayId = this.state.pathwayId as WritableSignal<string>;
  selectedElement = this.dataState.selectedElement;

  finalEventId = computed(() => {
    const pathwayId = this.pathwayId();
    const selected = this.selectedElement();
    if (pathwayId) return pathwayId;
    if (selected && isPathway(selected)) return selected.stId;
    return undefined;
  })

  biopaxId = computed(() => this.finalEventId()?.split('-')[2])

  finalPathwayName = computed(() => {
    const pathway = this.dataState.currentPathway();
    const selected = this.selectedElement();
    if (pathway) return pathway.displayName
    if (selected && isPathway(selected)) return selected.displayName;
    return undefined
  });

  hasResult = computed(() => !!(this.analysis.result()));
  hasDetail = computed(() => (this.dataState.hasDetail()));

  hasDownload = computed(() => {
    if (this.hasResult()) return true;
    return this.hasDetail();
  });


  token = computed(() => this.analysis.result()?.summary.token);
  currentAnalysisResource = computed(() => {
    return this.analysis.resourceFilterActive() ? this.analysis.resourceFilter() : 'TOTAL';
  });
  currentAnalysisSpecies = computed(() => {
    return this.analysis.speciesFilterActive() ? this.state.speciesFilter() : 'Homo Sapiens';
  });

  hasGSAReports = computed(() => this.analysis.gsaReportsRequired());
  gsaReports = computed(() => this.analysis.gsaReports());


  formats: DownloadFormat[] = Object.values(DownloadFormat) as DownloadFormat[];

  diagramItems = computed<DiagramItem[]>(() => {
    const hasEHLD = this.ehld.hasEHLD();
    const filteredFormats = this.formats.filter(format => {
      return (hasEHLD || format !== DownloadFormat.SVG) && (allowGif || format !== DownloadFormat.GIF);
      const allowGif = this.analysis.samples().length > 1;
    });

    return filteredFormats.map(format => {
      const isExportable = [DownloadFormat.SVG, DownloadFormat.PPTX, DownloadFormat.GIF].includes(format);
      if (isExportable) {
        return {
          format: format,
          url: signal(this.getExportUrl(format)),
          icon: 'image',
          download: true
        }
      }
      // png and jpeg for new style diagram, svg is on its way...
      return {
        format: format,
        icon: 'image',
        method: () => this.onDiagramDownload(format)
      }
    });
  })


  pathwayItems: PathwayItem[] = [
    {
      name: 'SBML',
      url: computed(() => `${CONTENT_SERVICE}/exporter/event/${this.finalEventId()}.sbml`),
    },
    {
      name: 'SBGN',
      url: computed(() => `${CONTENT_SERVICE}/exporter/event/${this.finalEventId()}.sbgn`),
    },
    {
      name: 'BioPAX2',
      url: computed(() => `${RESTFUL_API}/biopaxExporter/Level2/${this.biopaxId()}`),
      fileName: computed(() => `${this.biopaxId()}.xml`)
    },
    {
      name: 'BioPAX3',
      url: computed(() => `${RESTFUL_API}/biopaxExporter/Level3/${this.biopaxId()}`),
      fileName: computed(() => `${this.biopaxId()}.xml`)
    },
    {
      name: 'PDF',
      url: computed(() => {
        const url = `${CONTENT_SERVICE}/exporter/document/event/${this.finalEventId()}.pdf`;
        const analysisUrl = `${CONTENT_SERVICE}/exporter/document/event/${this.finalEventId()}.pdf?token=${this.token()}`;
        return this.hasResult() ? analysisUrl : url
      }),
    }
  ]

  analysisItems: AnaLysisItem[] = [
    {
      title: 'CSV Result',
      description: 'Download the pathway analysis results in CSV format for selected resource',
      url: computed(() => `${ANALYSIS_SERVICE}/download/${this.token()}/pathways/${this.currentAnalysisResource()}/result.csv`),
      icon: 'table',
      isShown: computed(() => !this.analysis.isGSA())
    },

    {
      title: 'JSON Result',
      description: 'Download a compressed file containing the complete analysis results in JSON format fot all resources',
      url: computed(() => `${ANALYSIS_SERVICE}/download/${this.token()}/result.json.gz`),
      icon: 'data_object',
      isShown: signal(true)
    },

    {
      title: 'PDF Result',
      description: 'Download a detailed report with the most significant pathway analysis results in PDF format',
      url: computed(() => `${ANALYSIS_SERVICE}/report/${this.token()}/${this.currentAnalysisSpecies()}/report.pdf`),
      icon: 'docs',
      isShown: computed(() => !this.analysis.isGSA())
    },

    {
      title: 'Identifier Mapping CSV',
      description: 'Download the identifier mappings between the submitted data and the selected resource in CSV format',
      url: computed(() => `${ANALYSIS_SERVICE}/download/${this.token()}/entities/found/${this.currentAnalysisResource()}/mapping.csv`),
      icon: 'table',
      isShown: signal(true)
    },

    {
      title: 'Not Found Identifiers CSV',
      description: 'Download a CSV file containing those identifiers from the submitted sample that we were not mapped',
      url: computed(() => `${ANALYSIS_SERVICE}/download/${this.token()}/entities/notfound/not_found.csv`),
      icon: 'table',
      isShown: signal(true)
    }]

  constructor(private state: UrlStateService,
              private http: HttpClient,
              private dataState: DataStateService,
              private analysis: AnalysisService,
              private download: DownloadService,
              public ehld: EhldService,) {
  }

  getGsaIcon(name: string) {
    switch (name) {
      case 'MS Excel Report (xlsx)':
        return 'table';
      case 'PDF Report':
        return 'docs';
      case 'R Script':
        return 'code_blocks';
      default:
        return '';
    }
  }

  getGsaLabel(name: string) {
    if (name === 'MS Excel Report (xlsx)') return 'Excel Report';
    return name
  }

  getExportUrl(format: string) {
    const analysisUrl = `${CONTENT_SERVICE}/exporter/diagram/${this.pathwayId()}.${format}?token=${this.token()}`
    const url = `${CONTENT_SERVICE}/exporter/diagram/${this.pathwayId()}.${format}`
    return this.hasResult() ? analysisUrl : url
  }

  onReacfoamDownload(format: DownloadFormat) {
    this.download.requestDownload(DownloadTarget.REACFOAM, format);
  }

  onDiagramDownload(format: DownloadFormat) {
    this.download.requestDownload(DownloadTarget.DIAGRAM, format);
  }

  protected readonly DownloadFormat = DownloadFormat;
}
