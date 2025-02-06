import {Component, computed, effect, input} from '@angular/core';
import {MatTreeNestedDataSource} from "@angular/material/tree";
import {sortByYearDescending} from "../../../services/utils";
import {Summation} from "../../../model/graph/summation.model";


@Component({
  selector: 'cr-summation-refs-tree',
  templateUrl: './summation-refs-tree.html',
  styleUrl: './summation-refs-tree.scss',
  standalone: false
})
export class SummationRefsTreeComponent {


  readonly summation = input.required({
    transform: (summation: Summation)=> {
      summation.literatureReference = sortByYearDescending(summation.literatureReference);
      return summation;
    }
  });
  title = computed(() => `${this.summation()?.literatureReference.length} references`);

  dataSource = new MatTreeNestedDataSource<Summation>();


  constructor() {
    effect(() => this.dataSource.data = [this.summation()]);
  }

//@ts-ignore
  childrenAccessor = (summation: Summation): Summation[] => summation.literatureReference ?? [];

  hasChild = (_: number, summation: Summation) => !!summation.literatureReference && summation.literatureReference.length > 0;


}
