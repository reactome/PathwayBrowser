import {Component, computed, input} from '@angular/core';
import {Event} from "../../../model/event.model";
import {isDefined} from "../../../services/utils";

@Component({
    selector: 'cr-description-overview',
    templateUrl: './description-overview.component.html',
    styleUrl: './description-overview.component.scss',
    standalone: false
})
export class DescriptionOverviewComponent {

  readonly obj = input.required<Event>();

  readonly allRefs = computed(() => [...this.obj().literatureReference || [], ...this.obj().summation.flatMap(s => s.literatureReference).filter(isDefined) || []] );
  reviewStar: { [key: string]: { percentage: number, score: number } } = {
    "five stars": {percentage: 100, score: 5},
    "four stars": {percentage: 80, score: 4},
    "three stars": {percentage: 60, score: 3},
    "two stars": {percentage: 40, score: 2},
    "one stars": {percentage: 20, score: 1}
  };

}
