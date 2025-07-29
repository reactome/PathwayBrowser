import {ChangeDetectionStrategy, Component, output} from '@angular/core';
import {MatTab, MatTabGroup, MatTabLabel} from "@angular/material/tabs";
import {AsyncPipe} from "@angular/common";
import {QualitativeAnalysisComponent} from "./qualitative-analysis/qualitative-analysis.component";
import {HttpClient} from "@angular/common/http";
import {SafePipe} from "../../pipes/safe.pipe";

@Component({
  selector: 'cr-analysis-form',
  imports: [
    MatTab,
    MatTabGroup,
    MatTabLabel,
    QualitativeAnalysisComponent,
    QualitativeAnalysisComponent,
    SafePipe,
    AsyncPipe
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

  constructor(private http: HttpClient) { }
}
