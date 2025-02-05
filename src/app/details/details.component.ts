import {AfterViewInit, Component} from '@angular/core';
import {UntilDestroy, untilDestroyed} from "@ngneat/until-destroy";
import {AnalysisService} from "../services/analysis.service";
import {Analysis} from "../model/analysis.model";
import {DatabaseObject} from "../model/graph/database-object.model";
import {DatabaseObjectService} from "../services/database-object.service";


@Component({
    selector: 'cr-details-panel',
    templateUrl: './details.component.html',
    styleUrls: ['./details.component.scss'],
    // Disabled the view encapsulation strategy by setting ViewEncapsulation.None to make sure that the component styles are exposed to be customizable.
    // encapsulation: ViewEncapsulation.None,
    standalone: false
})
@UntilDestroy()
export class DetailsComponent implements AfterViewInit {

  obj?: DatabaseObject;
  analysisResult?: Analysis.Result;


  constructor(
    private analysis: AnalysisService,
    private dboService: DatabaseObjectService) {
  }

  ngAfterViewInit(): void {

    this.dboService.selectedObj$.pipe(untilDestroyed(this)).subscribe(obj => {
      this.obj = obj;
    });

    this.analysis.result$.pipe(untilDestroyed(this)).subscribe(result => {
      this.analysisResult = result;
    })

  }

}
