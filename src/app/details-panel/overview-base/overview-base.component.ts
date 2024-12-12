import {AfterViewInit, Component, Input, OnInit} from '@angular/core';
import {Event} from "../../model/event.model";
import {NgForOf, NgIf} from "@angular/common";

@Component({
  selector: 'cr-overview-base',
  standalone: true,
  imports: [
    NgIf,
    NgForOf
  ],
  templateUrl: './overview-base.component.html',
  styleUrl: './overview-base.component.scss'
})
export class OverviewBaseComponent implements AfterViewInit{

  @Input('obj') obj?: Event;




  labelValues: { label: string, value: string }[] = [];

  ngAfterViewInit(): void {
    // @ts-ignore
    if(this.obj){
      console.log(this.obj);
    }
  }


}
