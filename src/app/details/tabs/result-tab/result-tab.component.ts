import {Component, computed, effect, ElementRef, signal, Signal, untracked, viewChild} from '@angular/core';
import {AnalysisService} from "../../../services/analysis.service";
import {MatHeaderRow, MatTableDataSource, MatTableModule} from "@angular/material/table";
import {Analysis} from "../../../model/analysis.model";
import {MatPaginator, MatPaginatorModule} from "@angular/material/paginator";
import {MatSort, MatSortModule, Sort} from "@angular/material/sort";
import {DecimalPipe} from "@angular/common";
import {ScientificNumberPipe} from "../../../pipes/scientific-number.pipe";
import {UrlStateService} from "../../../services/url-state.service";
import {MatIcon} from "@angular/material/icon";
import {MatTooltip} from "@angular/material/tooltip";
import {DataStateService} from "../../../services/data-state.service";
import {Router} from "@angular/router";
import {TypeSafeMatCellDef} from "../../../utils/type-safe-mat-cell-def.directive";
import {TypeSafeMatRowDef} from "../../../utils/type-safe-mat-row-def.directive";
import {NotFoundTableComponent} from "./not-found-table/not-found-table.component";
import {FormsModule} from "@angular/forms";
import {MatIconButton} from "@angular/material/button";
import {MatMenuModule} from "@angular/material/menu";
import {MatCheckbox, MatCheckboxChange} from "@angular/material/checkbox";
import {MatRadioButton, MatRadioGroup} from "@angular/material/radio";
import {ExpressionTagComponent} from "./expression-tag/expression-tag.component";
import {MatExpansionModule} from "@angular/material/expansion";


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
    NotFoundTableComponent,
    FormsModule,
    MatIconButton,
    MatMenuModule,
    MatCheckbox,
    MatRadioGroup,
    MatRadioButton,
    ExpressionTagComponent,
    MatExpansionModule
  ],
  templateUrl: './result-tab.component.html',
  styleUrl: './result-tab.component.scss'
})
export class ResultTabComponent {

  trackBy = (index: number, pathway: Analysis.Pathway) => pathway.stId + '-' + index;

  isGSA = computed(() => this.analysis.result()?.summary?.type === 'GSA_REGULATION');

  expressionColumnNames = computed(() => this.analysis.result()?.expression?.columnNames || []);

  expressionColumnIds = computed(() => this.expressionColumnNames().map((_, i) => `entities-exp-${i}`));

  displayedColumns: Signal<string[]> = computed(() => [
    'name',
    'entities-found', 'entities-total',
    // 'entities-ratio',
    'entities-pValue', 'entities-fdr',
    ...this.expressionColumnIds(),
    'reactions-found', 'reactions-total',
    // 'reactions-ratio',
    'species-name',
  ]);

  dataSource = new MatTableDataSource<Analysis.Pathway>()

  paginator = viewChild.required(MatPaginator)
  sort = viewChild.required(MatSort)
  container = viewChild.required<ElementRef<HTMLDivElement>>('container')

  headerRowHeight = signal('56px')
  selectedRowHeight = signal('56px')

  sizeObserver = new ResizeObserver(() => {
    setTimeout(() => {
      this.headerRowHeight.set((document.querySelector('tr.pathway-header-row')?.clientHeight || 56) + 'px')
      this.selectedRowHeight.set((document.querySelector('tr.pathway-row.selected')?.clientHeight || 56) + 'px')
    })
  });

  currentSort = signal<Sort>({active: 'entities-pValue', direction: 'desc'})


  filterLLP = this.state.groupingFilter
  filterNotDisease = this.state.notDiseaseFilter

  filteredData = computed(() => {
    let data = this.analysis.result()?.pathways || [];
    if (this.filterLLP()) data = data.filter(p => p.llp)
    if (this.filterNotDisease()) data = data.filter(p => !p.inDisease)
    return data;
  })

  speciesOptions = computed(() => {
    const activatedFilters = new Set(untracked(this.state.speciesFilter));
    console.log(activatedFilters, this.analysis.speciesOptions().map(s => s.taxId))
    return this.analysis.speciesOptions().map(s => ({...s, value: activatedFilters.has(s.taxId)}))
  })

  constructor(
    public analysis: AnalysisService,
    public state: UrlStateService,
    public data: DataStateService,
    private router: Router
  ) {
    this.dataSource.sortingDataAccessor = (data, header) => header.split('-').reduce((a: any, b) => a?.[b], data);
    effect(() => {
      this.sizeObserver.observe(this.container().nativeElement)
    });
    effect(() => {
      this.dataSource.paginator = this.paginator()
      this.dataSource.sort = this.sort()
    });
    effect(() => this.dataSource.data = this.filteredData());
    effect(() => this.currentSort() && this.paginator().firstPage());
    effect(() => {
      const stId = this.data.selectedPathwayStId();
      if (!stId) return;
      setTimeout(() => {
        const index = this.dataSource.sortData(this.dataSource.filteredData, this.sort()).findIndex(p => p.stId === stId);
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

    effect(() => {
      this.analysis.selectedPathwayFoundEntities.value() // When found entity finished loading
      const stId = untracked(this.data.selectedPathwayStId);
      setTimeout(() => {
        document.getElementById(`pathway-${stId}-row`)?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
          inline: 'start'
        })
      })

    });
  }

  selectPathway(pathway: Analysis.Pathway) {
    // if (this.state.select() !== pathway.stId) {
    this.data.selectedPathwayStId.set(pathway.stId)
    this.state.select.set(pathway.stId)
    // } else {
    //   this.data.selectedPathwayStId.set(undefined)
    //   this.state.select.set(null)
    // }
  }

  visitPathway(pathway: Analysis.Pathway) {
    this.data.selectedPathwayStId.set(pathway.stId)
    console.log("Navigating to " + pathway.stId)
    this.router.navigate([pathway.stId], {queryParamsHandling: 'preserve', preserveFragment: true})
  }


  onTogglableFilterClick(event: MouseEvent, checkbox: MatCheckbox) {
    event.stopPropagation(); // Avoid closing menu
    checkbox.toggle()
  }

  onToggleSpecies(event: MatCheckboxChange) {
    const value = event.source.value;
    this.state.speciesFilter.update(filters =>
      event.checked ?
        [...filters, value] :
        filters.filter(f => f !== value)
    )
  }

  foundEntities = computed(() => {
    const found = this.analysis.selectedPathwayFoundEntities.value();
    return [...found?.entities || []]
  })

  resourceColumnIds = computed(() => this.analysis.selectedPathwayFoundEntities.value()?.resources || [])
  expandedExpressionColumnIds = computed(() => this.expressionColumnIds().map(id => "expand-" + id));


  expandedColumns = computed(() => this.analysis.selectedPathwayFoundEntities.value() ? [
    'expand-id',
    ...this.resourceColumnIds(),
    ...this.expandedExpressionColumnIds()
  ] : [])

  isExpanded = (index: number, pathway: Analysis.Pathway) => {
    return pathway.stId === this.data?.selectedPathwayStId()
  }


}
