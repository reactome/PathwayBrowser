import {Component, Input} from '@angular/core';
import {Event} from "../../../model/event.model";

@Component({
  selector: 'cr-description-overview',
  templateUrl: './description-overview.component.html',
  styleUrl: './description-overview.component.scss'
})
export class DescriptionOverviewComponent {

  @Input('obj') obj?: Event;

  reviewStar: { [key: string]: { percentage: number, score: number } } = {
    "five stars": {percentage: 100, score: 5},
    "four stars": {percentage: 80, score: 4},
    "three stars": {percentage: 60, score: 3},
    "two stars": {percentage: 40, score: 2},
    "one stars": {percentage: 20, score: 1}
  };


  isShortContent(text: string): boolean {
    // Consider content "short" if it has 500 characters or less
    return text.length <= 500;
  }

  getLeftColumnContent(text: string): string {
    const words = text.split(' ');
    const mid = Math.ceil(words.length / 2);
    return words.slice(0, mid).join(' ');
  }

  getRightColumnContent(text: string): string {
    const words = text.split(' ');
    const mid = Math.ceil(words.length / 2);
    return words.slice(mid).join(' ');
  }

}
