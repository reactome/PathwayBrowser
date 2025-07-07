import {Component, computed, linkedSignal, Signal, viewChild} from '@angular/core';
import {MatTableModule} from "@angular/material/table";
import {MatIconModule} from "@angular/material/icon";
import {MatPaginatorModule} from "@angular/material/paginator";
import {MatTooltipModule} from "@angular/material/tooltip";
import {TypeSafeMatCellDef} from "../../../../utils/type-safe-mat-cell-def.directive";
import {TypeSafeMatRowDef} from "../../../../utils/type-safe-mat-row-def.directive";
import {Analysis} from "../../../../model/analysis.model";
import {AnalysisService} from "../../../../services/analysis.service";
import chroma from "chroma-js";
import {MatProgressSpinner} from "@angular/material/progress-spinner";
import {UrlStateService} from "../../../../services/url-state.service";
import {ExpressionTagComponent} from "../expression-tag/expression-tag.component";

@Component({
  selector: 'cr-not-found-table',
  imports: [
    MatTableModule,
    MatPaginatorModule,
    MatTooltipModule,
    MatIconModule,
    TypeSafeMatCellDef,
    TypeSafeMatRowDef,
    MatProgressSpinner,
    ExpressionTagComponent,
  ],
  templateUrl: './not-found-table.component.html',
  styleUrl: './not-found-table.component.scss'
})
export class NotFoundTableComponent {

  isGSA = computed(() => this.analysis.result()?.summary?.type === 'GSA_REGULATION');

  expressionColumnNames = computed(() => this.analysis.result()?.expression?.columnNames || []);

  expressionColumnIds = computed(() => this.expressionColumnNames().map((_, i) => `entities-exp-${i}`));

  displayedColumns: Signal<string[]> = computed(() => [
    'id',
    ...this.expressionColumnIds(),
  ]);

  data = linkedSignal<Analysis.NotFoundIdentifier[] | undefined, Analysis.NotFoundIdentifier[]>({
    source: this.analysis.notFoundIdentifiersResource.value,
    computation: (source, previous?) => source || previous?.value || []
  })


  headerRow = viewChild.required<HTMLTableRowElement>('headerRow')
  scrollOffset = computed(() => (this.headerRow().clientHeight || 56) + 'px')


  constructor(public analysis: AnalysisService, public state: UrlStateService) {
  }

  onColor(background: chroma.Color): string {
    const oklch = background.get('oklch.l');
    return oklch > 0.70 ? 'black' : 'white';
  }

  stylePathwayExpression(notFound: Analysis.NotFoundIdentifier, expressionIndex: number): any {
    const color = this.analysis.palette().scale(notFound.exp[expressionIndex]);
    return {
      'background': color.hex(),
      'color': this.onColor(color)
    }
  }

}
