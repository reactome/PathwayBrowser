import {AfterViewInit, Component, Input, OnChanges, SimpleChanges} from '@angular/core';
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
export class DescriptionOverviewComponent implements AfterViewInit, OnChanges {

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
    this.getAllProperties(this.obj)
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['obj'] && changes['obj'].currentValue && this.obj) {
      this.getAllProperties(this.obj)
    }
  }

  getAllProperties(obj: DatabaseObject) {
    this.category = getProperty(obj, 'category');
    this.className = getProperty(obj, 'className');
    this.speciesName = getProperty(obj, 'speciesName');
    this.compartment = getProperty(obj, 'compartment');
    this.name = getProperty(obj, 'name');
    this.tissue = getProperty(obj, 'tissue');
    this.reviewStatus = getProperty(obj, 'reviewStatus');
    this.summation = getProperty(obj, 'summation');
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
