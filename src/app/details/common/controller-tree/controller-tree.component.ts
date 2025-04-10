import {Component, input, signal, ViewChild} from '@angular/core';
import {DatabaseObject} from "../../../model/graph/database-object.model";
import {EntityTreeComponent} from "../entity-tree/entity-tree.component";


@Component({
  selector: 'cr-controller-tree',
  templateUrl: './controller-tree.component.html',
  styleUrl: './controller-tree.component.scss',
  standalone: false
})
export class ControllerTreeComponent<E extends DatabaseObject> {


  @ViewChild('entityTree') treeComponent!: EntityTreeComponent<any, any>;

  readonly type = input.required<string>();
  readonly depthControl = input.required<boolean>();
  readonly data = input.required<E[]>();


  depthIndex = signal(1);
  depthChangeSource = signal<'controller' | 'tree' | null>(null);
  maxDepth = signal(null);

  firstPage() {
    this.depthChangeSource.set('controller');
    this.depthIndex.set(1);
  }

  previousPage() {
    const depth = this.depthIndex();
    if (depth != null && depth > 1) {
      this.depthChangeSource.set('controller');
      this.depthIndex.update((d) => d! - 1);

    }
  }

  nextPage() {
    const maxLength = this.maxDepth();
    const depth = this.depthIndex();
    if (!maxLength || !depth) return;
    if (depth < maxLength) {
      this.depthChangeSource.set('controller');
      this.depthIndex.update((d) => d! + 1);

    }
  }

  lastPage() {
    const maxLength = this.maxDepth();
    if (!maxLength) return;
    this.depthChangeSource.set('controller');
    this.depthIndex.set(maxLength);
  }

}
