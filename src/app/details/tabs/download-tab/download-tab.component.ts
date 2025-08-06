import {Component, computed, signal, Signal, WritableSignal} from '@angular/core';
import {MatAnchor} from "@angular/material/button";
import {UrlStateService} from "../../../services/url-state.service";
import {HttpClient} from "@angular/common/http";
import {MatIcon} from "@angular/material/icon";
import {DataStateService} from "../../../services/data-state.service";
import {isPathway} from "../../../services/utils";
import {AnalysisService} from "../../../services/analysis.service";
import {environment} from "../../../../environments/environment";
import {toSignal} from "@angular/core/rxjs-interop";
import {SafePipe} from "../../../pipes/safe.pipe";
import {MatTooltip} from "@angular/material/tooltip";
import {MatProgressSpinner} from "@angular/material/progress-spinner";
import {DownloadFormat, ReacfoamService} from "../../../reacfoam/reacfoam.service";
import {EhldService} from "../../../services/ehld.service";


type PathwayItem = {
  name: string;
  url: string;
  fileName?: string;
}

type AnaLysisItem = {
  title: string;
  description?: string;
  url: string;
  icon: string;
  isShown: Signal<boolean>;
}


@Component({
  selector: 'cr-download-tab',
  imports: [
    MatAnchor,
    MatIcon,
    SafePipe,
    MatTooltip,
    MatProgressSpinner,

  ],
  templateUrl: './download-tab.component.html',
  styleUrl: './download-tab.component.scss'
})
export class DownloadTabComponent {

  newtIcon = toSignal(this.http.get('assets/icons/download/newt.svg', {responseType: 'text'}), {initialValue: ''});
  newtUrl = computed(() => `https://web.newteditor.org/?URL=${environment.host}/ContentService/exporter/event/${this.finalEventId()}.sbgn&inferNestingOnLoad=true&mapColorScheme=opposed_red_blue&fitLabelsToNodes=true`)

  pathwayId = this.state.pathwayId as WritableSignal<string>;
  selectedElement = this.dataState.selectedElement;

  finalEventId = computed(() => {
    const pathwayId = this.pathwayId();
    const selected = this.selectedElement();
    if (pathwayId) return pathwayId;
    if (selected && isPathway(selected)) return selected.stId;
    return undefined;
  })

  finalPathwayName = computed(() => {
    const pathway = this.dataState.currentPathway();
    const selected = this.selectedElement();
    if (pathway) return pathway.displayName
    if (selected && isPathway(selected)) return selected.displayName;
    return undefined
  });

  hasResult = computed(() => !!(this.analysis.result()) || this.analysis.gsaReportsRequired());
  hasDetail = computed(() => !!(this.state.select() || this.state.pathwayId()));

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


  pathwayItems: PathwayItem[] = [
    {
      name: 'SBML',
      url: `/ContentService/exporter/event/${this.finalEventId()}.sbml`
    },
    {
      name: 'SBGN',
      url: `/ContentService/exporter/event/${this.finalEventId()}.sbgn`,
    },
    {
      name: 'BioPAX2',
      url: `/ReactomeRESTfulAPI/RESTfulWS/biopaxExporter/Level2/${this.finalEventId()?.split('-')[2]}`,
      fileName: `${this.finalEventId()?.split('-')[2]}.xml`
    },
    {
      name: 'BioPAX3',
      url: `/ReactomeRESTfulAPI/RESTfulWS/biopaxExporter/Level3/${this.finalEventId()?.split('-')[2]}`,
      fileName: `${this.finalEventId()?.split('-')[2]}.xml`
    },
    {
      name: 'PDF',
      url: `/ContentService/exporter/document/event/${this.finalEventId()}.pdf`,
    }
  ]

  analysisItems: AnaLysisItem[] = [
    {
      title: 'Results CSV',
      description: 'Download the pathway analysis results in CSV format for selected resource',
      url: `/AnalysisService/download/${this.token()}/pathways/${this.currentAnalysisResource}/result.csv`,
      icon: 'table',
      isShown: computed(() => !this.analysis.isGSA())
    },

    {
      title: 'Results JSON',
      description: 'Download a compressed file containing the complete analysis results in JSON format fot all resources',
      url: `/AnalysisService/download/${this.token()}/result.json.gz`,
      icon: 'data_object',
      isShown: signal(true)
    },

    {
      title: 'Result PDF',
      description: 'Download a detailed report with the most significant pathway analysis results in PDF format',
      url: `/AnalysisService/report/${this.token()}/${this.currentAnalysisSpecies()}/report.pdf`,
      icon: 'docs',
      isShown: computed(() => !this.analysis.isGSA())
    },

    {
      title: 'Identifier Mapping CSV',
      description: 'Download the identifier mappings between the submitted data and the selected resource in CSV format',
      url: `/AnalysisService/download/${this.token()}/entities/found/${this.currentAnalysisResource()}/mapping.csv`,
      icon: 'table',
      isShown: signal(true)
    },

    {
      title: 'Not Found Identifiers CSV',
      description: 'Download a CSV file containing those identifiers from the submitted sample that we were not mapped',
      url: `/AnalysisService/download/${this.token()}/entities/notfound/not_found.csv`,
      icon: 'table',
      isShown: signal(true)
    }]

  constructor(private state: UrlStateService,
              private http: HttpClient,
              private dataState: DataStateService,
              private analysis: AnalysisService,
              private reacfoam: ReacfoamService) {
  }

  protected readonly environment = environment;

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

  onReacfoamDownload(format: DownloadFormat) {
    this.reacfoam.requestDownload(format);
  }
}
