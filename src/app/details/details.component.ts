import {AfterViewInit, Component} from '@angular/core';
import {EventService} from "../services/event.service";
import {DiagramStateService} from "../services/diagram-state.service";
import {Event} from "../model/event.model";
import {UntilDestroy, untilDestroyed} from "@ngneat/until-destroy";
import {AnalysisService} from "../services/analysis.service";
import {Analysis} from "../model/analysis.model";

@Component({
  selector: 'cr-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss']
})
@UntilDestroy()
export class DetailsComponent implements AfterViewInit {

  obj!: Event;

  analysisResult?: Analysis.Result;

  constructor(private eventService: EventService, private state: DiagramStateService, private analysis: AnalysisService) {
  }

  ngAfterViewInit(): void {
    this.eventService.selectedObj$.pipe(untilDestroyed(this)).subscribe(event => {
      this.obj = event;
    });

    this.analysis.result$.pipe(untilDestroyed(this)).subscribe(result => {
      this.analysisResult = result;
    })

  }

}
