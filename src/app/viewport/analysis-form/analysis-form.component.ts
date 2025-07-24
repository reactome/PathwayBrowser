import {ChangeDetectionStrategy, Component, output} from '@angular/core';
import {MatTab, MatTabGroup, MatTabLabel} from "@angular/material/tabs";
import {NgOptimizedImage} from "@angular/common";
import {QualitativeAnalysisComponent} from "./qualitative-analysis/qualitative-analysis.component";

@Component({
  selector: 'cr-analysis-form',
  imports: [
    MatTab,
    MatTabGroup,
    MatTabLabel,
    NgOptimizedImage,
    QualitativeAnalysisComponent,
    QualitativeAnalysisComponent
  ],
  templateUrl: './analysis-form.component.html',
  styleUrl: './analysis-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AnalysisFormComponent {

  close = output<{ status: 'finished' | 'premature' }>()

}
