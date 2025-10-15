import {Component, computed, signal, Signal, WritableSignal} from '@angular/core';
import {UrlStateService} from "../../../services/url-state.service";
import {HttpClient} from "@angular/common/http";
import {DataStateService} from "../../../services/data-state.service";
import {isPathway} from "../../../services/utils";
import {AnalysisService} from "../../../services/analysis.service";
import {ANALYSIS_SERVICE, CONTENT_SERVICE, RESTFUL_API} from "../../../../environments/environment";
import {MatTooltip} from "@angular/material/tooltip";
import {MatProgressSpinner} from "@angular/material/progress-spinner";
import {EhldService} from "../../../services/ehld.service";
import {DownloadFormat, DownloadService, DownloadTarget} from "../../../services/download.service";
import {DownloadButtonComponent, Icon} from "./download-button/download-button.component";
import {MatDialog} from "@angular/material/dialog";
import {AnimatedDownloadFormComponent} from "./animated-download-form/animated-download-form.component";


type PathwayItem = {
  name: string;
  url: Signal<string>;
  fileName?: Signal<string> | undefined;
  icon?: Icon
}

type AnaLysisItem = {
  title: string;
  description?: string;
  url: Signal<string>;
  icon: Icon;
  isShown: Signal<boolean>;
}

type DiagramItem = {
  format: string;
  icon?: Icon;
  url?: Signal<string>;
  method?: () => void
  hasEHLD?: Signal<boolean>
  download?: boolean
}


@Component({
  selector: 'cr-download-tab',
  imports: [
    MatTooltip,
    MatProgressSpinner,
    DownloadButtonComponent,

  ],
  templateUrl: './download-tab.component.html',
  styleUrl: './download-tab.component.scss'
})
export class DownloadTabComponent {
  newtUrl = computed(() => {
    const reactomeUrl = new URL(`${CONTENT_SERVICE}/exporter/event/${this.finalEventId()}.sbgn&inferNestingOnLoad=true&mapColorScheme=opposed_red_blue&fitLabelsToNodes=true`, window.location.origin).href
    return `https://web.newteditor.org/?URL=${reactomeUrl}`;
  });
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
  hasEHLD = computed(() => this.ehld.hasEHLD());

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
  reacfoamFormats = [DownloadFormat.SVG, DownloadFormat.PNG, DownloadFormat.JPEG];

  diagramItems = computed<DiagramItem[]>(() => {
    return this.hasEHLD() ? this.getDiagramItems(true) : this.getDiagramItems(false);
  });

  getDiagramItems(isEHLD: boolean) {
    const formats = isEHLD ? this.reacfoamFormats : this.formats.filter(f => f !== DownloadFormat.SVG);

    return formats.map(format => {
      const hasAnalysis = isEHLD && !this.hasResult() ? format : false;
      const isExportable = isEHLD ? hasAnalysis : [DownloadFormat.PPTX, DownloadFormat.GIF].includes(format);
      // server side
      if (isExportable) {
        return {
          format,
          url: signal(this.getExportUrl(format)),
          icon: {id:'image'},
          download: true
        };
      }
      // client side
      return {
        format,
        icon: {id:'image'},
        method: () => this.onDiagramDownload(format)
      };
    });
  }


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
    },
    {
      name: 'Newt',
      url: this.newtUrl,
      icon: {id:'newt', svg: true}
    }
  ]

  analysisItems: AnaLysisItem[] = [
    {
      title: 'CSV Result',
      description: 'Download the pathway analysis results in CSV format for selected resource',
      url: computed(() => `${ANALYSIS_SERVICE}/download/${this.token()}/pathways/${this.currentAnalysisResource()}/result.csv`),
      icon: {id:'table'},
      isShown: computed(() => !this.analysis.isGSA())
    },

    {
      title: 'JSON Result',
      description: 'Download a compressed file containing the complete analysis results in JSON format fot all resources',
      url: computed(() => `${ANALYSIS_SERVICE}/download/${this.token()}/result.json.gz`),
      icon: {id:'data_object'},
      isShown: signal(true)
    },

    {
      title: 'PDF Result',
      description: 'Download a detailed report with the most significant pathway analysis results in PDF format',
      url: computed(() => `${ANALYSIS_SERVICE}/report/${this.token()}/${this.currentAnalysisSpecies()}/report.pdf`),
      icon: {id:'docs'},
      isShown: computed(() => !this.analysis.isGSA())
    },

    {
      title: 'Identifier Mapping CSV',
      description: 'Download the identifier mappings between the submitted data and the selected resource in CSV format',
      url: computed(() => `${ANALYSIS_SERVICE}/download/${this.token()}/entities/found/${this.currentAnalysisResource()}/mapping.csv`),
      icon: {id:'table'},
      isShown: signal(true)
    },

    {
      title: 'Not Found Identifiers CSV',
      description: 'Download a CSV file containing those identifiers from the submitted sample that we were not mapped',
      url: computed(() => `${ANALYSIS_SERVICE}/download/${this.token()}/entities/notfound/not_found.csv`),
      icon: {id:'table'},
      isShown: signal(true)
    }]

  constructor(private state: UrlStateService,
              private http: HttpClient,
              private dataState: DataStateService,
              public analysis: AnalysisService,
              private download: DownloadService,
              public ehld: EhldService,
              private dialog: MatDialog,) {
  }

  getGsaIcon(name: string): Icon | undefined {
    switch (name) {
      case 'MS Excel Report (xlsx)':
        return {id:'table'};
      case 'PDF Report':
        return {id:'docs'};
      case 'R Script':
        return {id:'code_blocks'};
      default:
        return ;
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

  onReacfoamAnimatedDownload() {
    const matDialogRef = this.dialog.open(AnimatedDownloadFormComponent);
    matDialogRef.afterClosed().subscribe(options => {
      if (options) {
        this.download.requestDownload(DownloadTarget.REACFOAM, DownloadFormat.SVG, options);
      }
    })
  }

  onEHLDAnimatedDownload() {
    const matDialogRef = this.dialog.open(AnimatedDownloadFormComponent);
    matDialogRef.afterClosed().subscribe(options => {
      if (options) {
        this.download.requestDownload(DownloadTarget.DIAGRAM, DownloadFormat.SVG, options);
      }
    })
  }

  onDiagramDownload(format: DownloadFormat) {
    this.download.requestDownload(DownloadTarget.DIAGRAM, format);
  }

}
