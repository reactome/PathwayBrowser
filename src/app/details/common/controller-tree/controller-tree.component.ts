import {Component, input, signal} from '@angular/core';
import {DatabaseObject} from "../../../model/graph/database-object.model";


@Component({
  selector: 'cr-controller-tree',
  templateUrl: './controller-tree.component.html',
  styleUrl: './controller-tree.component.scss',
  standalone: false
})
export class ControllerTreeComponent<E extends DatabaseObject> {

  readonly type = input.required<string>();
  readonly depthControl = input.required<boolean>();
  readonly data = input.required<E[]>();


  depthIndex = signal(1);
  depthChangeSource = signal<'controller' | 'tree' | undefined>(undefined);
  maxDepth = signal(undefined);

  firstPage() {
    this.depthChangeSource.set('controller');
    this.depthIndex.set(1);
  }

  previousPage() {
    const depth = this.depthIndex();
    if (depth > 1) {
      this.depthChangeSource.set('controller');
      this.depthIndex.update((d) => d - 1);
    }
  }

  nextPage() {
    const maxLength = this.maxDepth();
    const depth = this.depthIndex();
    if (!maxLength) return;
    if (depth < maxLength) {
      this.depthChangeSource.set('controller');
      this.depthIndex.update((d) => d + 1);

    }
  }

  lastPage() {
    const maxLength = this.maxDepth();
    if (!maxLength) return;
    this.depthChangeSource.set('controller');
    this.depthIndex.set(maxLength);
  }

}
