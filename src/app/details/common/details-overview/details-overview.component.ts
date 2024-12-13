import {AfterViewInit, Component, Input} from '@angular/core';
import {Event} from "../../../model/event.model";

@Component({
  selector: 'cr-details-overview',
  templateUrl: './details-overview.component.html',
  styleUrl: './details-overview.component.scss'
})
export class DetailsOverviewComponent implements AfterViewInit{

  @Input('obj') obj?: Event;




  labelValues: { label: string, value: string }[] = [];

  ngAfterViewInit(): void {
    // @ts-ignore
    if(this.obj){
      console.log(this.obj);
    }
  }


}
