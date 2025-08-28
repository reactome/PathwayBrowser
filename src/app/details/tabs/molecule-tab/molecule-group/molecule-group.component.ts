import {Component, computed, input, signal} from '@angular/core';
import type {MoleculeGroup} from "../molecule-tab.component";
import {ObjectTreeComponent} from "../../../common/object-tree/object-tree.component";
import {MatPaginator, PageEvent} from "@angular/material/paginator";

@Component({
  selector: 'cr-molecule-group',
  imports: [
    ObjectTreeComponent,
    MatPaginator,
    MatPaginator
  ],
  templateUrl: './molecule-group.component.html',
  styleUrl: './molecule-group.component.scss'
})
export class MoleculeGroupComponent {

  readonly group = input.required<MoleculeGroup>();
  readonly pageSize = input<number>(50);
  readonly currentPage = signal<PageEvent>({pageIndex: 0, pageSize: 50, length: 0});

  readonly sortedData = computed(() => this.group().data.sort((a, b) => a.highlight !== b.highlight
    ? +b.highlight - +a.highlight // Sort by highlight first
    : b.stoichiometry - a.stoichiometry // Then sort by name
  ));

  readonly hasPagination = computed(() => this.sortedData().length > this.pageSize());
  readonly pagedData = computed(() => this.hasPagination()
    ? this.sortedData().slice(this.currentPage().pageIndex * this.currentPage().pageSize, (this.currentPage().pageIndex + 1) * this.currentPage().pageSize)
    : this.sortedData()
  );

  sanitizeId(label: string): string {
    return label
      .toLowerCase()
      .replace(/\s+/g, '-')           // Replace spaces with dashes
      .replace(/[^a-z0-9-_]/g, '');   // Remove special characters
  }


  getStatistics(graph: MoleculeGroup) {
    const found = graph.found;
    const total = graph.data.length;
    return found ? `${found} / ${total}` : `${total}`
  }

}
