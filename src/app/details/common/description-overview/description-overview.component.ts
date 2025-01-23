import {AfterViewInit, Component, Input} from '@angular/core';
import {DatabaseObject} from "../../../model/graph/database-object.model";
import {getProperty} from "../../../services/utils";
import {Compartment} from "../../../model/graph/compartment.model";
import {Anatomy} from "../../../model/graph/anatomy.model";
import {ReviewStatus} from "../../../model/graph/review-status.model";
import {Summation} from 'src/app/model/graph/summation.model';


@Component({
  selector: 'cr-description-overview',
  templateUrl: './description-overview.component.html',
  styleUrl: './description-overview.component.scss'
})
export class DescriptionOverviewComponent implements AfterViewInit {

  @Input('obj') obj?: DatabaseObject;

  category?: string;
  className?: string;
  speciesName?: string;
  compartment?: Compartment[];
  name?: string;
  tissue?: Anatomy;
  reviewStatus?: ReviewStatus;
  summation?: Summation[];

  reviewStar: { [key: string]: { percentage: number, score: number } } = {
    "five stars": {percentage: 100, score: 5},
    "four stars": {percentage: 80, score: 4},
    "three stars": {percentage: 60, score: 3},
    "two stars": {percentage: 40, score: 2},
    "one stars": {percentage: 20, score: 1}
  };


  ngAfterViewInit(): void {

    if (!this.obj) return;
    this.category = getProperty(this.obj, 'category');
    this.className = getProperty(this.obj, 'className');
    this.speciesName = getProperty(this.obj, 'speciesName');
    this.compartment = getProperty(this.obj, 'compartment');
    this.name = getProperty(this.obj, 'name');
    this.tissue = getProperty(this.obj, 'tissue');
    this.reviewStatus = getProperty(this.obj, 'reviewStatus');
    this.summation = getProperty(this.obj, 'summation');

  }

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
