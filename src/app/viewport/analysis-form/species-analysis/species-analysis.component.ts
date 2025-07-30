import {Component, output} from '@angular/core';

@Component({
  selector: 'cr-species-analysis',
  imports: [],
  templateUrl: './species-analysis.component.html',
  styleUrl: './species-analysis.component.scss'
})
export class SpeciesAnalysisComponent {
  close = output<{ status: 'finished' | 'premature' }>()

}
