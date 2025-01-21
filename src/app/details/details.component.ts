 import {AfterViewInit, Component, ElementRef, ViewChild, ViewEncapsulation} from '@angular/core';
import {EventService} from "../services/event.service";
import {Event} from "../model/event.model";
import {UntilDestroy, untilDestroyed} from "@ngneat/until-destroy";
import {AnalysisService} from "../services/analysis.service";
import {Analysis} from "../model/analysis.model";


@Component({
  selector: 'cr-details-panel',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss'],
  // Disabled the view encapsulation strategy by setting ViewEncapsulation.None to make sure that the component styles are exposed to be customizable.
  encapsulation: ViewEncapsulation.None
})
@UntilDestroy()
export class DetailsComponent implements AfterViewInit {

  obj?: Event;
  analysisResult?: Analysis.Result;


  @ViewChild('tabGroup', { read: ElementRef }) tabGroup?: ElementRef;
  firstTabWidth?: number;

  constructor(private eventService: EventService,
              private analysis: AnalysisService) {
  }

  ngAfterViewInit(): void {

    this.eventService.selectedObj$.pipe(untilDestroyed(this)).subscribe(event => {
      this.obj = event;
    });

    this.analysis.result$.pipe(untilDestroyed(this)).subscribe(result => {
      this.analysisResult = result;
    })


    if (this.tabGroup) {
      this.getFirstTabWidth();
    }

  }

  private getFirstTabWidth() {

    if (this.tabGroup){
      const firstTab = this.tabGroup.nativeElement.querySelector('#firstTab');
      if (firstTab) {
        this.firstTabWidth = firstTab.offsetWidth;
      }
    }

  }

}
