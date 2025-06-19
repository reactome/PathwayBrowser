import {
  Component,
  computed,
  effect,
  ElementRef,
  linkedSignal,
  signal,
  Signal,
  untracked,
  viewChild
} from '@angular/core';
import {AnalysisService} from "../../../services/analysis.service";
import {MatTableDataSource, MatTableModule} from "@angular/material/table";
import {Analysis} from "../../../model/analysis.model";
import {MatPaginator, MatPaginatorModule} from "@angular/material/paginator";
import {MatSort, MatSortModule, Sort} from "@angular/material/sort";
import {DecimalPipe} from "@angular/common";
import {ScientificNumberPipe} from "../../../pipes/scientific-number.pipe";
import {UrlStateService} from "../../../services/url-state.service";
import {MatIconModule} from "@angular/material/icon";
import {MatTooltip} from "@angular/material/tooltip";
import {DataStateService} from "../../../services/data-state.service";
import {Router} from "@angular/router";
import {TypeSafeMatCellDef} from "../../../utils/type-safe-mat-cell-def.directive";
import {TypeSafeMatRowDef} from "../../../utils/type-safe-mat-row-def.directive";
import {NotFoundTableComponent} from "./not-found-table/not-found-table.component";
import {FormsModule} from "@angular/forms";
import {MatButtonModule} from "@angular/material/button";
import {MatMenuModule} from "@angular/material/menu";
import {MatCheckbox, MatCheckboxChange} from "@angular/material/checkbox";
import {MatRadioButton, MatRadioGroup} from "@angular/material/radio";
import {ExpressionTagComponent} from "./expression-tag/expression-tag.component";
import {MatExpansionModule} from "@angular/material/expansion";
import {FoundTableComponent} from "./found-table/found-table.component";
import {MatSliderModule} from "@angular/material/slider";
import {getArrayStats} from "../../../services/utils";


@Component({
  selector: 'cr-result-tab',
  imports: [
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    DecimalPipe,
    ScientificNumberPipe,
    MatIconModule,
    MatTooltip,
    TypeSafeMatCellDef,
    TypeSafeMatRowDef,
    NotFoundTableComponent,
    FormsModule,
    MatButtonModule,
    MatMenuModule,
    MatCheckbox,
    MatRadioGroup,
    MatRadioButton,
    ExpressionTagComponent,
    MatExpansionModule,
    FoundTableComponent,
    MatSliderModule
  ],
  templateUrl: './result-tab.component.html',
  styleUrl: './result-tab.component.scss'
})
export class ResultTabComponent {

  trackBy = (index: number, pathway: Analysis.Pathway) => pathway.stId + '-' + index;

  hasExpression = computed(() => this.analysis.result()?.expression !== undefined)
  minExpression = computed(() => this.analysis.result()?.expression?.min || 0)
  maxExpression = computed(() => this.analysis.result()?.expression?.max || 100)

  expressionColumnNames = computed(() => this.analysis.result()?.expression?.columnNames || []);

  expressionColumnIds = computed(() => this.expressionColumnNames().map((_, i) => `entities-exp-${i}`));

  displayedColumns: Signal<string[]> = computed(() => [
    'name',
    'expand-entities',
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
  expandedRowHeight = signal('56px')

  sizeObserver = new ResizeObserver(() => {
    setTimeout(() => {
      this.headerRowHeight.set((document.querySelector('tr.pathway-header-row')?.clientHeight || 56) + 'px')
      this.expandedRowHeight.set((document.querySelector('tr.pathway-row.expanded')?.clientHeight || 56) + 'px')
    })
  });

  currentSort = signal<Sort>({active: 'entities-pValue', direction: 'desc'})


  filterPValue = linkedSignal(() => this.state.pValueFilter() !== undefined ? this.state.pValueFilter() : 1)
  filterMinSize = linkedSignal(() => this.state.pathwayMinSizeFilter() !== undefined ? this.state.pathwayMinSizeFilter() : this.pathwaySizeStats().min)
  filterMaxSize = linkedSignal(() => this.state.pathwayMaxSizeFilter() !== undefined ? this.state.pathwayMaxSizeFilter() : this.pathwaySizeStats().max)

  filterMinExpression = linkedSignal(() => this.state.minExpressionFilter() !== undefined ? this.state.minExpressionFilter() : this.minExpression())
  filterMaxExpression = linkedSignal(() => this.state.maxExpressionFilter() !== undefined ? this.state.maxExpressionFilter() : this.maxExpression())

  filterLLP = this.state.groupingFilter
  filterNotDisease = this.state.notDiseaseFilter

  filteredDataNoSize = computed(() => {
    let data = this.analysis.result()?.pathways || [];
    let size = data.length
    if (this.filterLLP()) {
      data = data.filter(p => p.llp)
      console.log('Filter llp', size, '==>', data.length)
      size = data.length
    }
    if (this.filterNotDisease()) {
      data = data.filter(p => !p.inDisease)
      console.log('Filter disease', size, '==>', data.length)
      size = data.length
    }
    if (this.state.pValueFilter() !== undefined) {
      data = data.filter(p => p.entities.pValue <= this.state.pValueFilter()!)
      console.log('Filter pValue', size, '==>', data.length)
    }
    if (this.state.minExpressionFilter() !== undefined) {
      data = data.filter(p => p.entities.exp[this.analysis.sampleIndex()] >= this.state.minExpressionFilter()!)
      console.log('Filter minExpression', size, '==>', data.length)
    }
    if (this.state.maxExpressionFilter() !== undefined) {
      data = data.filter(p => p.entities.exp[this.analysis.sampleIndex()] <= this.state.maxExpressionFilter()!)
      console.log('Filter minExpression', size, '==>', data.length)
    }
    return data
  })

  pathwaySizeStats = computed(() => getArrayStats(this.filteredDataNoSize().map(p => p.entities.total)))

  filteredData = computed(() => {
    let data = this.filteredDataNoSize();
    let size = data.length
    if (this.state.pathwayMinSizeFilter()) {
      data = data.filter(p => p.entities.total >= this.state.pathwayMinSizeFilter()!)
      console.log('Filter min size', size, '==>', data.length)
      size = data.length
    }
    if (this.state.pathwayMaxSizeFilter()) {
      data = data.filter(p => p.entities.total <= this.state.pathwayMaxSizeFilter()!)
      console.log('Filter max size', size, '==>', data.length)
      size = data.length
    }
    console.log("Total filter", this.analysis.result()?.pathways.length, '==>', size)
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

    // Update URL from value change
    effect(() => this.state.pathwayMinSizeFilter.set(this.filterMinSize() !== this.pathwaySizeStats().min ? this.filterMinSize() : undefined));
    effect(() => this.state.pathwayMaxSizeFilter.set(this.filterMaxSize() !== this.pathwaySizeStats().max ? this.filterMaxSize() : undefined));
    effect(() => this.state.minExpressionFilter.set(this.filterMinExpression() !== this.minExpression() ? this.filterMinExpression() : undefined));
    effect(() => this.state.maxExpressionFilter.set(this.filterMaxExpression() !== this.maxExpression() ? this.filterMaxExpression() : undefined));
    effect(() => this.state.pValueFilter.set(this.filterPValue() !== 1 ? this.filterPValue() : undefined));
  }

  selectPathway(pathway: Analysis.Pathway) {
    // if (this.state.select() !== pathway.stId) {
    this.data.selectedPathwayStId.set(pathway.stId)
    this.state.select.set(pathway.stId)
    if (this.expandedPathway() !== undefined && this.expandedPathway() !== pathway) this.expandedPathway.set(pathway)
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


  isExpanded = (index: number, pathway: Analysis.Pathway) => {
    return this.expandedPathway() === pathway
  }

  expandedPathway = signal<Analysis.Pathway | undefined>(undefined)

  toggle(pathway: Analysis.Pathway) {
    this.expandedPathway.set(this.isExpanded(0, pathway) ? undefined : pathway)
  }

  formatExpression = (expression: number) => this.analysis.expressionScientificFormat() ?
    expression.toExponential(0) :
    expression.toFixed(0)

  colorExpression = (expression: number | undefined) => this.analysis.palette().scale(expression).hex()

  localMinExpression = linkedSignal(() => this.filterMinExpression() || this.minExpression())
  localMaxExpression = linkedSignal(() => this.filterMaxExpression() || this.maxExpression())
  expressionRange = computed(() => this.maxExpression() - this.minExpression())
  gradientMask = computed(() => {
    const startPercentage = (this.localMinExpression() - this.minExpression()) / this.expressionRange() * 100;
    const endPercentage = (this.localMaxExpression() - this.minExpression()) / this.expressionRange() * 100;
    return `linear-gradient(to right,
                             black       ${startPercentage}%,
                             transparent ${startPercentage}%,
                             transparent ${endPercentage}%,
                             black       ${endPercentage}%)`
  })

}
