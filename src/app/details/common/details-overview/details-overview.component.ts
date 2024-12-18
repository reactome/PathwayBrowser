import {Component, Input} from '@angular/core';
import {Event} from "../../../model/event.model";

@Component({
  selector: 'cr-details-overview',
  templateUrl: './details-overview.component.html',
  styleUrl: './details-overview.component.scss'
})
export class DetailsOverviewComponent {

  @Input('obj') obj?: Event;

  reviewStar: { [key: string]: { percentage: number, score: number } } = {
    "five stars": {percentage: 100, score: 5},
    "four stars": {percentage: 80, score: 4},
    "three stars": {percentage: 60, score: 3},
    "two stars": {percentage: 40, score: 2},
    "one stars": {percentage: 20, score: 1}
  };

}
