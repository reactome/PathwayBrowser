import {Component, computed, input, Signal} from '@angular/core';
import {DatabaseObject} from "../../../model/graph/database-object.model";
import {getProperty, isDefined} from "../../../services/utils";
import {Anatomy} from "../../../model/graph/external-ontology/anatomy.model";
import {ReviewStatus} from "../../../model/graph/review-status.model";
import {Summation} from 'src/app/model/graph/summation.model';
import {Compartment} from "../../../model/graph/go-term/compartment.model";
import {DataKeys} from "../../../constants/constants";



@Component({
  selector: 'cr-description-overview',
  templateUrl: './description-overview.component.html',
  styleUrl: './description-overview.component.scss',
  standalone: false
})
export class DescriptionOverviewComponent {

  readonly obj = input.required<DatabaseObject>();

  readonly allRefs = computed(() => {
    const literatureRefs = getProperty(this.obj(), DataKeys.LITERATURE_REFERENCE);
    const summation = getProperty(this.obj(), DataKeys.SUMMATION);
    return [...literatureRefs || [], ...summation.flatMap((s: Summation) => s.literatureReference).filter(isDefined) || []]
  });

  readonly category: Signal<string> = computed(() => getProperty(this.obj(), DataKeys.CATEGORY));
  readonly className: Signal<string> = computed(() => getProperty(this.obj(), DataKeys.CLASS_NAME));
  readonly speciesName: Signal<string> = computed(() => getProperty(this.obj(), DataKeys.SPECIES_NAME));
  readonly compartment: Signal<Compartment[]> = computed(() => getProperty(this.obj(), DataKeys.COMPARTMENT));
  readonly name: Signal<string> = computed(() => getProperty(this.obj(), DataKeys.COMPARTMENT));
  readonly tissue: Signal<Anatomy> = computed(() => getProperty(this.obj(), DataKeys.TISSUE));
  readonly reviewStatus: Signal<ReviewStatus> = computed(() => getProperty(this.obj(), DataKeys.REVIEW_STATUS));
  readonly summation: Signal<Summation> = computed(() => getProperty(this.obj(), DataKeys.SUMMATION));


  reviewStar: { [key: string]: { percentage: number, score: number } } = {
    "five stars": {percentage: 100, score: 5},
    "four stars": {percentage: 80, score: 4},
    "three stars": {percentage: 60, score: 3},
    "two stars": {percentage: 40, score: 2},
    "one stars": {percentage: 20, score: 1}
  };


}
