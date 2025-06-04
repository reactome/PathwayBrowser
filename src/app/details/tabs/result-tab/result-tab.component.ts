import {Component, computed, effect, linkedSignal, signal, Signal, viewChild} from '@angular/core';
import {AnalysisService} from "../../../services/analysis.service";
import {MatTableDataSource, MatTableModule} from "@angular/material/table";
import {Analysis} from "../../../model/analysis.model";
import {MatPaginator, MatPaginatorModule} from "@angular/material/paginator";
import {MatSort, MatSortModule, Sort} from "@angular/material/sort";
import {DecimalPipe} from "@angular/common";
import {ScientificNumberPipe} from "../../../pipes/scientific-number.pipe";
import {UrlStateService} from "../../../services/url-state.service";
import {MatIcon} from "@angular/material/icon";
import {MatTooltip} from "@angular/material/tooltip";
import {DataStateService} from "../../../services/data-state.service";
import {isPathway} from "../../../services/utils";
import {Router} from "@angular/router";
import {SelectableObject} from "../../../services/event.service";
import {TypeSafeMatCellDef} from "../../../utils/type-safe-mat-cell-def.directive";
import {TypeSafeMatRowDef} from "../../../utils/type-safe-mat-row-def.directive";
import chroma from "chroma-js";

type SelectionData = {
  selectedElement: SelectableObject | undefined,
  selectedElementLoading: boolean,
  currentPathway: string | undefined
}

@Component({
  selector: 'cr-result-tab',
  imports: [
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    DecimalPipe,
    ScientificNumberPipe,
    MatIcon,
    MatTooltip,
    TypeSafeMatCellDef,
    TypeSafeMatRowDef,
  ],
  templateUrl: './result-tab.component.html',
  styleUrl: './result-tab.component.scss'
})
export class ResultTabComponent {

  isGSA = computed(() => this.analysis.resultSignal()?.summary?.type === 'GSA_REGULATION');

  expressionColumnNames = computed(() => this.analysis.resultSignal()?.expression?.columnNames || []);

  expressionColumnIds = computed(() => this.expressionColumnNames().map((_, i) => `entities-exp-${i}`));

  displayedColumns: Signal<string[]> = computed(() => [
    'name',
    'entities-found', 'entities-total',
    // 'entities-ratio',
    'entities-pValue', 'entities-fdr',
    ...this.expressionColumnIds(),
    'reactions-found', 'reactions-total',
    // 'reactions-ratio',
    'species-name'
  ]);
  dataSource = new MatTableDataSource<Analysis.Pathway>()

  paginator = viewChild.required(MatPaginator)
  sort = viewChild.required(MatSort)
  headerRow = viewChild.required<HTMLTableRowElement>('headerRow')
  scrollOffset = computed(() => (this.headerRow().clientHeight || 56) + 'px')

  currentSort = signal<Sort>({active: 'entities-pValue', direction: 'desc'})

  selectionData = computed<SelectionData>(() => ({
    selectedElement: this.data.selectedElement(),
    selectedElementLoading: this.data.selectedElementLoading(),
    currentPathway: this.state.pathwayId()
  }))

  selectedPathwayStId = linkedSignal<SelectionData, string | undefined>({
    source: this.selectionData,
    computation: (source: SelectionData, previous?: { source: SelectionData, value: string | undefined }) => {
      if (source.selectedElementLoading && previous) return previous.value;
      if (source.selectedElement && isPathway(source.selectedElement)) return source.selectedElement.stId
      return source.currentPathway
    }
  })

  constructor(
    public analysis: AnalysisService,
    public state: UrlStateService,
    public data: DataStateService,
    private router: Router
  ) {
    this.dataSource.sortingDataAccessor = (data, header) => header.split('-').reduce((a: any, b) => a[b], data);
    effect(() => {
      console.log('paginator initiated')
      this.dataSource.paginator = this.paginator()
      this.dataSource.sort = this.sort()
    });
    effect(() => this.dataSource.data = this.analysis.resultSignal()?.pathways || []);
    effect(() => this.currentSort() && this.paginator().firstPage());
    effect(() => {
      const stId = this.selectedPathwayStId();
      console.log(stId)
      if (!stId) return;
      setTimeout(() => {
        const index = this.dataSource.sortData(this.dataSource.data, this.sort()).findIndex(p => p.stId === stId);
        const pageSize = this.paginator().pageSize || this.paginator().pageSizeOptions[0] || 20;
        const pageIndex = Math.floor(index / pageSize);

        this.paginator().pageIndex = pageIndex;
        this.paginator().page.next({
          length: this.paginator().length,
          pageSize, pageIndex
        })

        setTimeout(() => {
          document.getElementById(`pathway-${stId}-row`)?.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
            inline: 'start'
          })
        })
      })

    });
  }

  selectPathway(pathway: Analysis.Pathway) {
    this.selectedPathwayStId.set(pathway.stId)
    this.state.select.set(pathway.stId)
  }

  visitPathway(pathway: Analysis.Pathway) {
    this.selectedPathwayStId.set(pathway.stId)
    console.log("Navigating to " + pathway.stId)
    this.router.navigate([pathway.stId], {queryParamsHandling: 'preserve', preserveFragment: true})
  }

  onColor(background: chroma.Color): string {
    const oklch = background.get('oklch.l');
    return oklch > 0.70 ? 'black' : 'white';
  }

  stylePValue(pValue: number): any {
    const color = this.analysis.pValueScale().scale(pValue);
    const isSignificant = pValue < 0.05;

    return isSignificant ? {
      'background': color.hex(),
      'color': this.onColor(color)
    } : {
      'background': 'var(--surface)',
      'color': 'var(--on-surface)',
      'border': `2px solid ${color.hex()}`
    }
  }

  stylePathwayExpression(pathway: Analysis.Pathway, expressionIndex: number): any {
    const color = this.analysis.palette().scale(pathway.entities.exp[expressionIndex]);
    const isSignificant = pathway.entities.pValue < 0.05;

    return isSignificant ? {
      'background': color.hex(),
      'color': this.onColor(color)
    } : {
      'background': 'var(--surface)',
      'color': 'var(--on-surface)',
      'border': `2px solid ${color.hex()}`
    }
  }

}
