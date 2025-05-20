import {Component, computed, effect, input} from '@angular/core';
import {MatTreeNestedDataSource} from "@angular/material/tree";
import {sortByYearDescending} from "../../../services/utils";
import {LiteratureReference} from "../../../model/graph/publication/literature-reference.model";
import {Publication} from "../../../model/graph/publication/publication.model";


type ReferenceHolder = { literatureReference: (LiteratureReference | Publication)[] };

@Component({
  selector: 'cr-refs-tree',
  templateUrl: './refs-tree.html',
  styleUrl: './refs-tree.scss',
  standalone: false
})
export class RefsTreeComponent {


  readonly referenceHolder = input.required<ReferenceHolder, ReferenceHolder>({
    transform: (holder: ReferenceHolder) => {
      holder.literatureReference = sortByYearDescending(holder.literatureReference);
      return holder;
    }
  });
  title = computed(() => `${this.referenceHolder()?.literatureReference.length} references`);

  dataSource = new MatTreeNestedDataSource<ReferenceHolder>();


  constructor() {
    effect(() => this.dataSource.data = [this.referenceHolder()]);
  }

//@ts-ignore
  childrenAccessor = (holder: ReferenceHolder): ReferenceHolder[] => holder.literatureReference ?? [];

  hasChild = (_: number, holder: ReferenceHolder) => !!holder.literatureReference && holder.literatureReference.length > 0;


}
