import {
  ChangeDetectionStrategy,
  Component,
  createNgModule,
  Injector,
  output, signal,
  viewChild,
  ViewContainerRef
} from '@angular/core';
import {MatTab, MatTabChangeEvent, MatTabGroup, MatTabLabel} from "@angular/material/tabs";
import {AsyncPipe} from "@angular/common";
import {QualitativeAnalysisComponent} from "./qualitative-analysis/qualitative-analysis.component";
import {HttpClient} from "@angular/common/http";
import {SafePipe} from "../../pipes/safe.pipe";
import {GsaFormModule} from "reactome-gsa-form";
import {AnalysisService} from "../../services/analysis.service";
import {UrlStateService} from "../../services/url-state.service";
import {Report} from "reactome-gsa-form/lib/model/report-status.model";
import {AnalysisResult} from "reactome-gsa-form/lib/model/analysis-result.model";
import {QuantitativeAnalysisComponent} from "./quantitative-analysis/quantitative-analysis.component";
import {TissueAnalysisComponent} from "./tissue-analysis/tissue-analysis.component";
import {SpeciesAnalysisComponent} from "./species-analysis/species-analysis.component";

@Component({
  selector: 'cr-analysis-form',
  imports: [
    MatTab,
    MatTabGroup,
    MatTabLabel,
    QualitativeAnalysisComponent,
    QualitativeAnalysisComponent,
    SafePipe,
    AsyncPipe,
    GsaFormModule,
    QuantitativeAnalysisComponent,
    TissueAnalysisComponent,
    SpeciesAnalysisComponent
  ],
  templateUrl: './analysis-form.component.html',
  styleUrl: './analysis-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AnalysisFormComponent {

  qualitative = this.http.get('assets/icons/analysis/Qualitative.svg', {responseType: 'text'})
  quantitative = this.http.get('assets/icons/analysis/Quantitative.svg', {responseType: 'text'})
  species = this.http.get('assets/icons/analysis/SpeciesCompare.svg', {responseType: 'text'})
  tissue = this.http.get('assets/icons/analysis/TissueCompare.svg', {responseType: 'text'})

  close = output<{ status: 'finished' | 'premature' }>()

  constructor(private http: HttpClient,  private state: UrlStateService, public analysis: AnalysisService) {
  }

}
