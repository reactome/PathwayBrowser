import {Component, computed, effect, input} from '@angular/core';
import {MatTreeNestedDataSource} from "@angular/material/tree";
import {sortByYearDescending} from "../../../services/utils";
import {Summation} from "../../../model/graph/summation.model";
import {MarkerReference} from "../../../model/graph/control-reference/marker-reference.model";


export type RefTree = Summation | MarkerReference;

@Component({
  selector: 'cr-refs-tree',
  templateUrl: './refs-tree.html',
  styleUrl: './refs-tree.scss',
  standalone: false
})
export class RefsTreeComponent {


  readonly refs = input.required({
    transform: (refTree: RefTree) => {
      refTree.literatureReference = sortByYearDescending(refTree.literatureReference);
      return refTree;
    }
  });
  title = computed(() => `${this.refs()?.literatureReference.length} references`);

  dataSource = new MatTreeNestedDataSource<RefTree>();


  constructor() {
    effect(() => this.dataSource.data = [this.refs()]);
  }

//@ts-ignore
  childrenAccessor = (refTree: RefTree): RefTree[] => refTree.literatureReference ?? [];

  hasChild = (_: number, refTree: RefTree) => !!refTree.literatureReference && refTree.literatureReference.length > 0;

}
