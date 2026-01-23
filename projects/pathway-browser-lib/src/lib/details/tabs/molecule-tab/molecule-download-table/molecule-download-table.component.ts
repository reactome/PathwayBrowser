import {Component, computed, effect, input, linkedSignal, signal, Signal, viewChild} from '@angular/core';
import {MoleculeGroup} from "../molecule-tab.component";
import {MatTable, MatTableModule} from "@angular/material/table";
import {MatCheckbox} from "@angular/material/checkbox";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MatSort, MatSortHeader} from "@angular/material/sort";
import {MatIcon} from "@angular/material/icon";
import {MatButton, MatIconButton} from "@angular/material/button";
import {MatMenu, MatMenuItem, MatMenuTrigger} from "@angular/material/menu";
import {MatTooltip} from "@angular/material/tooltip";
import {TableVirtualScrollDataSource, TableVirtualScrollModule} from "ng-table-virtual-scroll";
import {ScrollingModule} from "@angular/cdk/scrolling";


type MoleculeRow = {
  [key: string]: string;
  type: string;
  identifier: string;
  name: string
}

@Component({
  selector: 'cr-molecule-download-table',
  imports: [
    MatCheckbox,
    MatSort,
    MatSortHeader,
    MatIcon,
    MatButton,
    ReactiveFormsModule,
    FormsModule,
    MatIconButton,
    MatMenuTrigger,
    MatMenu,
    MatMenuItem,
    MatTooltip,
    TableVirtualScrollModule,
    ScrollingModule,
    MatTableModule
  ],
  templateUrl: './molecule-download-table.component.html',
  styleUrl: './molecule-download-table.component.scss'
})
export class MoleculeDownloadTableComponent {

  moleculeData = input.required<MoleculeGroup[]>();
  sort = viewChild.required(MatSort);
  objId = input.required<string | undefined>();

  table = viewChild.required(MatTable);

  tableData = computed(() => {
    return this.moleculeData().flatMap(group =>
      group.data.map(data => {
        const entity = data.entity;
        return {
          type: entity.type,
          identifier: entity.identifier,
          name: entity.formattedName
        }
      })
    )
  })

  category = computed(() => this.moleculeData().map(data => data.category));

  selectedCategory = linkedSignal(() => this.category());

  includeType = signal(true);
  includeIdentifier = signal(true);
  includeName = signal(true);

  displayedColumns: Signal<string[]> = computed(() =>
    ['type', 'identifier', 'name']
  );

  exportedColumns: Signal<string[]> = computed(() => {
    const fields = [];
    if (this.includeType()) fields.push('type');
    if (this.includeIdentifier()) fields.push('identifier');
    if (this.includeName()) fields.push('name');
    return fields;
  })

  filteredData = computed<MoleculeRow[]>(() => {
    return this.tableData().filter(molecule =>
      this.selectedCategory().includes(molecule.type)
    );
  })

  finalData = computed(() => this.filteredData() ?? this.tableData());

  maxWidths = computed(() => {
    const columns = this.displayedColumns()
    const maxData = new Map<string, string>(columns.map(column => [column, '']));
    this.filteredData().forEach(row => {
      columns.forEach(column => {
        if (maxData.get(column)!.length < row[column].length) maxData.set(column, row[column]);
      })
    })
    return maxData;
  })

  dataSource = new TableVirtualScrollDataSource<MoleculeRow>([]);

  constructor() {

    effect(() => {
      this.dataSource.data = this.finalData();
      this.table().renderRows();
    });

    effect(() => {
      this.dataSource.sort = this.sort();
      this.table().renderRows();
    });
  }

  getExportData() {
    return this.tableData()
      .filter(molecule => this.selectedCategory().includes(molecule.type))
      .map(row => {
        const newRow = {} as MoleculeRow;
        if (this.includeType()) newRow.type = row.type;
        if (this.includeIdentifier()) newRow.identifier = row.identifier;
        if (this.includeName()) newRow.name = row.name;
        return newRow;
      })
      .filter(row => Object.keys(row).length > 0);
  }


  exportToTSV(): void {
    if (!this.tableData() || this.tableData().length === 0) return;

    const exportData = this.getExportData();

    const keys = this.exportedColumns();
    const tsvRows = [
      keys.join('\t'),
      ...exportData.map((row: MoleculeRow) => keys.map(key => row[key]).join('\t'))
    ];

    const tsvContent = tsvRows.join('\n');
    const blob = new Blob([tsvContent], {type: 'text/tab-separated-values'});

    const a = document.createElement('a');
    a.href = window.URL.createObjectURL(blob);
    a.download = `Participating Molecules [${this.objId()}].tsv`;
    a.click();
    a.remove();
  }

  onCategoryToggle(category: string) {
    const currentValue = this.selectedCategory();
    if (!currentValue.includes(category)) {
      this.selectedCategory.set([...currentValue, category]);
    } else {
      this.selectedCategory.set(currentValue.filter(c => c !== category));
    }
  }
}
