import {Component, computed, effect, signal, Signal, WritableSignal} from '@angular/core';
import {MatDivider} from "@angular/material/divider";
import {MatAnchor} from "@angular/material/button";
import {UrlStateService} from "../../../services/url-state.service";
import {HttpClient} from "@angular/common/http";
import {SafePipe} from "../../../pipes/safe.pipe";
import {MatIcon} from "@angular/material/icon";
import {DataStateService} from "../../../services/data-state.service";
import {isPathway} from "../../../services/utils";
import {AnalysisService} from "../../../services/analysis.service";
import {environment} from "../../../../environments/environment";
import {toSignal} from "@angular/core/rxjs-interop";


type PathwayItem = {
  type: string;
  url: string;
  icon: Signal<string>;
  isSVGIcon: boolean;
}

type AnaLysisItem = {
  title: string;
  description?: string;
  url: string;
  icon: Signal<string>;
  isShown: Signal<boolean>;
}


@Component({
  selector: 'cr-download-tab',
  imports: [
    MatDivider,
    MatAnchor,
    SafePipe,
    MatIcon
  ],
  templateUrl: './download-tab.component.html',
  styleUrl: './download-tab.component.scss'
})
export class DownloadTabComponent {


  sbml = toSignal(this.http.get('assets/icons/species/homo-sapiens.svg', {responseType: 'text'}), {initialValue: ''});
  sbgn = toSignal(this.http.get('assets/icons/species/homo-sapiens.svg', {responseType: 'text'}), {initialValue: ''});
  bioPax2 = toSignal(this.http.get('assets/icons/species/homo-sapiens.svg', {responseType: 'text'}), {initialValue: ''});
  bioPax3 = toSignal(this.http.get('assets/icons/species/homo-sapiens.svg', {responseType: 'text'}), {initialValue: ''});
  newt = toSignal(this.http.get('assets/icons/species/homo-sapiens.svg', {responseType: 'text'}), {initialValue: ''});

  pathwayId = this.state.pathwayId as WritableSignal<string>;
  selectedElement = this.data.selectedElement;
  finalPathwayId = computed(() => {
    const pathwayId = this.pathwayId();
    const selected = this.selectedElement();
    if (pathwayId) return pathwayId;
    if (selected && isPathway(selected)) return selected.stId;
    return undefined;
  })


  hasResult = computed(() => !!(this.analysis.result()) || this.analysis.gsaReportsRequired());
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
      type: 'sbml',
      url: `${environment.host}/ContentService/exporter/event/${this.finalPathwayId()}.sbml`,
      icon: this.sbml,
      isSVGIcon: true
    },
    {
      type: 'sbgn',
      url: `${environment.host}/ContentService/exporter/event/${this.finalPathwayId()}.sbgn`,
      icon: this.sbgn,
      isSVGIcon: true
    },
    {
      type: 'bioPax2',
      url: `${environment.host}/ReactomeRESTfulAPI/RESTfulWS/biopaxExporter/Level2/${this.finalPathwayId()}`,
      icon: this.bioPax2,
      isSVGIcon: true
    },
    {
      type: 'bioPax3',
      url: `${environment.host}/ReactomeRESTfulAPI/RESTfulWS/biopaxExporter/Level3/${this.finalPathwayId()}`,
      icon: this.bioPax3,
      isSVGIcon: true
    },
    {
      type: '',
      url: `${environment.host}/ContentService/exporter/event/${this.finalPathwayId()}.pdf`,
      icon: signal('picture_as_pdf'),
      isSVGIcon: false
    },
    {
      type: 'newt',
      url: `https://web.newteditor.org/?URL=${environment.host}/ContentService/exporter/event/${this.finalPathwayId()}.sbgn&inferNestingOnLoad=true&mapColorScheme=opposed_red_blue&fitLabelsToNodes=true`,
      icon: this.newt,
      isSVGIcon: true
    },
  ]

  analysisItems: AnaLysisItem[] = [
    {
      title: 'Pathway Analysis Results in CSV format',
      url: `${environment.host}/AnalysisService/download/${this.token()}/pathways/${this.currentAnalysisResource}/result.csv`,
      icon: this.sbml,
      isShown: computed(() => !this.analysis.isGSA())
    },

    {
      title: 'Compressed Pathway Analysis Results in JSON Format',
      url: `${environment.host}/AnalysisService/download/${this.token()}/result.json.gz`,
      icon: this.sbml,
      isShown: signal(true)
    },

    {
      title: 'Analysis Results in PDF Format',
      url: `${environment.host}/AnalysisService/report/${this.token()}/${this.currentAnalysisSpecies}/report.pdf`,
      icon: this.sbml,
      isShown: computed(() => !this.analysis.isGSA())
    },

    {
      title: 'Identifier Mapping in CSV format',
      url: `${environment.host}/AnalysisService/download/${this.token()}/entities/found/${this.currentAnalysisResource}/mapping.csv`,
      icon: this.sbml,
      isShown: signal(true)
    },

    {
      title: 'Not Found Identifiers in CSV Format',
      url: `${environment.host}/AnalysisService/dowmload/${this.token()}/entities/notfound/not_found.csv`,
      icon: this.sbml,
      isShown: signal(true)
    }]

  constructor(private state: UrlStateService,
              private http: HttpClient,
              private data: DataStateService,
              private analysis: AnalysisService) {
    effect(() => {
      console.log("pathwayId", this.finalPathwayId());
      console.log("hasResult", this.analysis.result());
      console.log("isGSA", this.analysis.isGSA());
      console.log("hasGSAReports", this.hasGSAReports());
      console.log("GSAReports", this.gsaReports());
      console.log("hasAnalysisResult", this.analysis.result());
      // console.log("analysisResourceFilter", this.analysis.resourceFilter());
      // console.log("analysisResourceOptions", this.analysis.resourceOptions());
      // console.log("analysisResourceFilterActive", this.analysis.resourceFilterActive());
      console.log("analysis result", this.analysisItems);
    });
  }

  protected readonly environment = environment;

  getGsaIcon(name: string) {
    switch (name) {
      case 'MS Excel Report (xlsx)':
        return 'table_view';
      case 'PDF Report':
        return 'picture_as_pdf';
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

}
