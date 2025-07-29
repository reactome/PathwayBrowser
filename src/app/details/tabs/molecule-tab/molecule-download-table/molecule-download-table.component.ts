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
import {MatFormField, MatLabel} from "@angular/material/form-field";
import {MatOption, MatSelect} from "@angular/material/select";
import {MatCheckbox} from "@angular/material/checkbox";
import {FormsModule} from "@angular/forms";
import {MatSort, MatSortHeader} from "@angular/material/sort";
import {MatIcon} from "@angular/material/icon";
import {MatButton} from "@angular/material/button";


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
    MatFormField,
    MatSelect,
    MatOption,
    MatLabel,
    MatCheckbox,
    FormsModule,
    MatSort,
    MatSortHeader,
    MatIcon,
    MatButton
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

  displayedColumns: Signal<string[]> = computed(() => {
      const columns = [];
      if (this.includeType()) columns.push('type')
      if (this.includeIdentifier()) columns.push('identifier')
      if (this.includeName()) columns.push('name')
      return columns;
    }
  );


  filteredData = computed(() => {

    let data = this.tableData();

    console.log("selectedType", this.selectedCategory())
    console.log("include Type", this.includeType());
    console.log("include identifier", this.includeIdentifier());
    console.log("include name", this.includeName());

    data = data.filter(molecule => this.selectedCategory().includes(molecule.type))
      .map(row => {
        const {type, identifier, name, ...rest} = row;
        const newRow = {...rest} as MoleculeRow;

        if (this.includeType()) newRow.type = type;
        if (this.includeIdentifier()) newRow.identifier = identifier;
        if (this.includeName()) newRow.name = name;

        return newRow;
      });
    return data;
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


  exportToTSV(): void {
    if (!this.tableData() || this.tableData().length === 0) return;

    const keys = this.displayedColumns();
    const tsvRows = [
      keys.join('\t'),
      ...this.tableData().map((row: MoleculeRow) => keys.map(key => row[key]).join('\t'))
    ];

    const tsvContent = tsvRows.join('\n');
    const blob = new Blob([tsvContent], {type: 'text/tab-separated-values'});

    const a = document.createElement('a');
    a.href = window.URL.createObjectURL(blob);
    a.download = `Participating Molecules [${this.objId()}].tsv`;
    a.click();
  }
}
