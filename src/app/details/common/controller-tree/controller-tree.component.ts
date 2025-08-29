import {Component, computed, input, linkedSignal, signal} from '@angular/core';
import {DatabaseObject} from "../../../model/graph/database-object.model";
import {PageEvent} from "@angular/material/paginator";


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
  readonly scope = input<'entity' | 'event'>('entity');

  readonly pageSize = input(30);

  depthIndex = signal(1);
  depthChangeSource = signal<'controller' | 'tree' | undefined>(undefined);
  maxDepth = signal(undefined);

  hasPagination = computed(() => this.data().length > this.pageSize());
  currentPage = linkedSignal<PageEvent>(() => ({pageIndex: 0, pageSize: this.pageSize(), length: 0}));
  displayedData = computed(() => {
    return this.hasPagination()
        ? this.data().slice(
          this.currentPage().pageIndex * this.currentPage().pageSize,
          (this.currentPage().pageIndex + 1) * this.currentPage().pageSize)
        : this.data()
    }
  )

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
