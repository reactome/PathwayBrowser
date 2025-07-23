import {Component, output} from '@angular/core';

@Component({
  selector: 'cr-analysis-form',
  imports: [],
  templateUrl: './analysis-form.component.html',
  styleUrl: './analysis-form.component.scss'
})
export class AnalysisFormComponent {

  close = output<{status: 'finished' | 'premature'}>()

}
