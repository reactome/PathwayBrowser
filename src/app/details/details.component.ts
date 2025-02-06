import {AfterViewInit, Component} from '@angular/core';
import {UntilDestroy, untilDestroyed} from "@ngneat/until-destroy";
import {AnalysisService} from "../services/analysis.service";
import {Analysis} from "../model/analysis.model";
import {DataStateService} from "../services/data-state.service";


@Component({
  selector: 'cr-details-panel',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss'],
  standalone: false
})
@UntilDestroy()
export class DetailsComponent implements AfterViewInit {

  obj = this.dataState.selectedElement;
  analysisResult?: Analysis.Result;


  constructor(
    private analysis: AnalysisService,
    private dataState: DataStateService,) {
  }

  ngAfterViewInit(): void {

    this.analysis.result$.pipe(untilDestroyed(this)).subscribe(result => {
      this.analysisResult = result;
    })

  }

}
