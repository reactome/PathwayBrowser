import {Component, computed, input, Signal} from '@angular/core';
import {DatabaseObject} from "../../../model/graph/database-object.model";
import {getProperty, isDefined} from "../../../services/utils";
import {Anatomy} from "../../../model/graph/external-ontology/anatomy.model";
import {ReviewStatus} from "../../../model/graph/review-status.model";
import {Summation} from 'src/app/model/graph/summation.model';
import {Compartment} from "../../../model/graph/go-term/compartment.model";



@Component({
  selector: 'cr-description-overview',
  templateUrl: './description-overview.component.html',
  styleUrl: './description-overview.component.scss',
  standalone: false
})
export class DescriptionOverviewComponent {

  readonly obj = input.required<DatabaseObject>();

  readonly allRefs = computed(() => {
    const literatureRefs = getProperty(this.obj(), 'literatureReference');
    const summation = getProperty(this.obj(), 'summation');
    return [...literatureRefs || [], ...summation.flatMap((s: Summation) => s.literatureReference).filter(isDefined) || []]
  });

  readonly category: Signal<string> = computed(() => getProperty(this.obj(), 'category'));
  readonly className: Signal<string> = computed(() => getProperty(this.obj(), 'className'));
  readonly speciesName: Signal<string> = computed(() => getProperty(this.obj(), 'speciesName'));
  readonly compartment: Signal<Compartment[]> = computed(() => getProperty(this.obj(), 'compartment'));
  readonly name: Signal<string> = computed(() => getProperty(this.obj(), 'name'));
  readonly tissue: Signal<Anatomy> = computed(() => getProperty(this.obj(), 'tissue'));
  readonly reviewStatus: Signal<ReviewStatus> = computed(() => getProperty(this.obj(), 'reviewStatus'));
  readonly summation: Signal<Summation> = computed(() => getProperty(this.obj(), 'summation'));


  reviewStar: { [key: string]: { percentage: number, score: number } } = {
    "five stars": {percentage: 100, score: 5},
    "four stars": {percentage: 80, score: 4},
    "three stars": {percentage: 60, score: 3},
    "two stars": {percentage: 40, score: 2},
    "one stars": {percentage: 20, score: 1}
  };


}
