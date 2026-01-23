import {Component, computed, effect, input} from '@angular/core';
import {
  MatNestedTreeNode,
  MatTree,
  MatTreeNestedDataSource, MatTreeNodeDef,
  MatTreeNodeOutlet,
  MatTreeNodeToggle
} from "@angular/material/tree";
import {sortByYearDescending} from "../../../services/utils";
import {LiteratureReference} from "../../../model/graph/publication/literature-reference.model";
import {Publication} from "../../../model/graph/publication/publication.model";
import {PublicationComponent} from "../publication/publication.component";
import {MatIcon} from "@angular/material/icon";
import {MatButton} from "@angular/material/button";


type ReferenceHolder = { literatureReference: (LiteratureReference | Publication)[] };

@Component({
  selector: 'cr-refs-tree',
  templateUrl: './refs-tree.html',
  imports: [
    MatTree,
    MatNestedTreeNode,
    PublicationComponent,
    MatIcon,
    MatTreeNodeOutlet,
    MatButton,
    MatTreeNodeToggle,
    MatTreeNodeDef
  ],
  styleUrl: './refs-tree.scss'
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
