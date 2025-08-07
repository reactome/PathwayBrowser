import {Component, computed, effect, input, linkedSignal, signal, Signal, viewChild} from '@angular/core';
import {MoleculeGroup} from "../molecule-tab.component";
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderCellDef,
  MatHeaderRow,
  MatHeaderRowDef,
  MatRow,
  MatRowDef,
  MatTable,
  MatTableDataSource
} from "@angular/material/table";
import {MatCheckbox} from "@angular/material/checkbox";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MatSort, MatSortHeader} from "@angular/material/sort";
import {MatIcon} from "@angular/material/icon";
import {MatButton, MatIconButton} from "@angular/material/button";
import {MatMenu, MatMenuItem, MatMenuTrigger} from "@angular/material/menu";
import {MatTooltip} from "@angular/material/tooltip";


type MoleculeRow = {
  [key: string]: string;
  type: string;
  identifier: string;
  name: string
}

@Component({
  selector: 'cr-molecule-download-table',
  imports: [
    MatTable,
    MatColumnDef,
    MatHeaderCell,
    MatCell,
    MatHeaderRow,
    MatRow,
    MatHeaderCellDef,
    MatCellDef,
    MatHeaderRowDef,
    MatRowDef,
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
    MatTooltip
  ],
  templateUrl: './molecule-download-table.component.html',
  styleUrl: './molecule-download-table.component.scss'
})
export class MoleculeDownloadTableComponent {

  moleculeData = input.required<MoleculeGroup[]>();
  sort = viewChild.required(MatSort);
  objId = input.required<string>();

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

  filteredData = computed(() => {
    return this.tableData().filter(molecule =>
      this.selectedCategory().includes(molecule.type)
    );
  })

  dataSource = new MatTableDataSource<MoleculeRow>([]);

  constructor() {

    effect(() => {
      this.dataSource.data = this.tableData();
    });

    effect(() => {
      this.dataSource.data = this.filteredData();
    });

    effect(() => {
      this.dataSource.sort = this.sort();
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
