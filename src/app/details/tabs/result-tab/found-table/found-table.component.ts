import {Component, computed, effect, input, untracked, viewChild} from '@angular/core';
import {ExpressionTagComponent} from "../expression-tag/expression-tag.component";
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderRow,
  MatHeaderRowDef,
  MatRecycleRows, MatRow, MatRowDef, MatTable, MatTableDataSource, MatTableModule
} from "@angular/material/table";
import {TypeSafeMatCellDef} from "../../../../utils/type-safe-mat-cell-def.directive";
import {TypeSafeMatRowDef} from "../../../../utils/type-safe-mat-row-def.directive";
import {Analysis} from "../../../../model/analysis.model";
import {AnalysisService} from "../../../../services/analysis.service";
import {rxResource} from "@angular/core/rxjs-interop";
import {of} from "rxjs";
import {UrlStateService} from "../../../../services/url-state.service";
import {MatSort, MatSortModule} from "@angular/material/sort";
import FoundEntities = Analysis.FoundEntities;
import FoundEntity = Analysis.FoundEntity;

@Component({
  selector: 'cr-found-table',
  imports: [
    ExpressionTagComponent,
    MatTableModule,
    TypeSafeMatCellDef,
    TypeSafeMatRowDef,
    MatSortModule
  ],
  templateUrl: './found-table.component.html',
  styleUrl: './found-table.component.scss'
})
export class FoundTableComponent {

  pathway = input.required<Analysis.Pathway>()

  headerRowHeight = input<string>('56px')
  parentRowHeight = input<string>('56px')

  dataSource = new MatTableDataSource<FoundEntity>([]);

  sort = viewChild.required(MatSort)

  constructor(public analysis: AnalysisService, public state: UrlStateService) {
    this.dataSource.sortingDataAccessor = (data, header) => {
      console.log('sortingData', data, header)
      const value = header.split('-').reduce((a: any, b) => a?.[b], data);
      if (value) return value;
      else return data.mapsTo.find(m => m.resource === header)?.ids.length || 0 // Sort by mapping length for matches column
    }

    effect(() => this.dataSource.data = this.foundEntities());
    effect(() => this.dataSource.sort = this.sort());
    effect(() => {
      this.pathwayFoundEntities.value() // When found entity finished loading
      const stId = untracked(this.pathway).stId;
      setTimeout(() => {
        document.getElementById(`pathway-${stId}-row`)?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
          inline: 'start'
        })
      })

    });
  }

  pathwayFoundEntities = rxResource({
    request: () => ({
      pathway: this.pathway().stId,
      token: this.state.analysis(),
      resource: this.analysis.resourceFilter()
    }),
    loader: ({request}) => request.pathway && request.token ?
      this.analysis.foundEntities(request.pathway, request.token, request.resource || undefined) :
      of()
  })

  foundEntities = computed(() => {
    const found = this.pathwayFoundEntities.value();
    return [...found?.entities || []]
  })

  resourceColumnIds = computed(() => this.pathwayFoundEntities.value()?.resources || [])
  expressionColumnNames = computed(() => this.analysis.result()?.expression?.columnNames || []);
  expressionColumnIds = computed(() => this.expressionColumnNames().map((_, i) => `exp-${i}`));

  expandedColumns = computed(() => this.pathwayFoundEntities.value() ? [
    'id',
    ...this.resourceColumnIds(),
    ...this.expressionColumnIds()
  ] : [])


}
