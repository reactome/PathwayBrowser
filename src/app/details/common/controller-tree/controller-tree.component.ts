import {Component, computed, input, linkedSignal, Signal, signal} from '@angular/core';
import {DatabaseObject} from "../../../model/graph/database-object.model";
import {PageEvent} from "@angular/material/paginator";
import {max} from "lodash";
import {InDepth} from "../../../model/graph/in-depth.model";
import {Relationship} from "../../../model/graph/relationship.model";


@Component({
  selector: 'cr-controller-tree',
  templateUrl: './controller-tree.component.html',
  styleUrl: './controller-tree.component.scss',
  standalone: false
})
export class ControllerTreeComponent<E extends DatabaseObject & InDepth, R extends Relationship.Has<E>> {

  readonly type = input.required<string>();
  readonly depthControl = input.required<boolean>();
  readonly data = input.required<R[]>();
  readonly scope = input<'entity' | 'event'>('entity');

  readonly pageSize = input(30);

  depthIndex = signal(1);
  depthChangeSource = signal<'controller' | 'tree' | undefined>(undefined);
  maxDepth = computed(() => max(this.data().map(d => d.element.maxDepth))!);

  hasPagination = computed(() => this.data().length > this.pageSize());
  currentPage = linkedSignal<PageEvent>(() => ({pageIndex: 0, pageSize: this.pageSize(), length: 0}));
  displayedData: Signal<R[]> = computed(() => {
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
    if (this.depthIndex() > 1) {
      this.depthChangeSource.set('controller');
      this.depthIndex.update((d) => d - 1);
    }
  }

  nextPage() {
    if (this.depthIndex() < this.maxDepth()) {
      this.depthChangeSource.set('controller');
      this.depthIndex.update((d) => d + 1);

    }
  }

  lastPage() {
    this.depthChangeSource.set('controller');
    this.depthIndex.set(this.maxDepth());
  }
}
