import {Component, Input} from '@angular/core';
import {AnalysisService} from "../services/analysis.service";
import {DarkService} from "../services/dark.service";


@Component({
    selector: 'cr-diagram-home',
    templateUrl: './diagram-home.component.html',
    styleUrls: ['./diagram-home.component.scss'],
    standalone: false
})
export class DiagramHomeComponent {

  @Input('id') diagramId: string = '';

  constructor(public analysis: AnalysisService, public dark: DarkService) {
  }

  clearAnalysis() {
    this.analysis.clearAnalysis()
  }

}
