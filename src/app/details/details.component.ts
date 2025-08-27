import {Component, computed, linkedSignal} from '@angular/core';
import {UntilDestroy} from "@ngneat/until-destroy";
import {AnalysisService} from "../services/analysis.service";
import {DataStateService} from "../services/data-state.service";
import {UrlStateService} from "../services/url-state.service";


@Component({
  selector: 'cr-details-panel',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss'],
  standalone: false
})
@UntilDestroy()
export class DetailsComponent {

  obj = this.dataState.selectedElement;
  hasResult = computed(() => !!(this.analysis.result() || this.analysis.gsaReportsRequired()));
  hasDetail = computed(() => !!(this.state.select() || this.state.pathwayId()))

  selectedTabIndex = linkedSignal<number>(
    () => this.hasResult() ? 2 : // Has results => results tab
      this.hasDetail() ? 0 : // Has detail ==> detail tab
        4 // Nothing ==> Info tab
  )


  constructor(
    protected analysis: AnalysisService,
    public dataState: DataStateService,
    public state: UrlStateService) {
  }

}
