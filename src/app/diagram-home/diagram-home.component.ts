import {Component, input} from '@angular/core';
import {AnalysisService} from "../services/analysis.service";
import {DarkService} from "../services/dark.service";


@Component({
    selector: 'cr-diagram-home',
    templateUrl: './diagram-home.component.html',
    styleUrls: ['./diagram-home.component.scss'],
    standalone: false
})
export class DiagramHomeComponent {

  readonly diagramId = input<string>('', { alias: "id" });

  constructor(public analysis: AnalysisService, public dark: DarkService) {
  }

  clearAnalysis() {
    this.analysis.clearAnalysis()
  }

}
