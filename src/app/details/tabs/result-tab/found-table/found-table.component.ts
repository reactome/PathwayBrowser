import {Component, computed, effect, input, Signal, untracked, viewChild} from '@angular/core';
import {ExpressionTagComponent} from "../expression-tag/expression-tag.component";
import {MatTableDataSource, MatTableModule} from "@angular/material/table";
import {TypeSafeMatCellDef} from "../../../../utils/type-safe-mat-cell-def.directive";
import {TypeSafeMatRowDef} from "../../../../utils/type-safe-mat-row-def.directive";
import {Analysis} from "../../../../model/analysis.model";
import {AnalysisService} from "../../../../services/analysis.service";
import {rxResource} from "@angular/core/rxjs-interop";
import {of} from "rxjs";
import {UrlStateService} from "../../../../services/url-state.service";
import {MatSort, MatSortModule} from "@angular/material/sort";
import {TitleCasePipe} from "@angular/common";
import {MatIcon} from "@angular/material/icon";

type ResourceMap = { [resource: string]: string[] };
type FoundIdentifier = {
  id: string
  exp: number[]
  entities: ResourceMap
  interactors?: string[],
}

@Component({
  selector: 'cr-found-table',
  imports: [
    ExpressionTagComponent,
    MatTableModule,
    TypeSafeMatCellDef,
    TypeSafeMatRowDef,
    MatSortModule,
    TitleCasePipe,
    MatIcon
  ],
  templateUrl: './found-table.component.html',
  styleUrl: './found-table.component.scss'
})
export class FoundTableComponent {

  pathway = input.required<Analysis.Pathway>()

  headerRowHeight = input<string>('56px')
  parentRowHeight = input<string>('56px')

  dataSource = new MatTableDataSource<FoundIdentifier>([]);

  sort = viewChild.required(MatSort)

  constructor(public analysis: AnalysisService, public state: UrlStateService) {
    this.dataSource.sortingDataAccessor = (data, header) => {
      const value = header.split('-').reduce((a: any, b) => a?.[b], data);
      if (value instanceof Array) return arrayToSortableString(value); // Interactors
      if (value) return value; // Expressions + identifier
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

  foundEntities: Signal<FoundIdentifier[]> = computed(() => {
    const found = this.pathwayFoundEntities.value();
    if (!found) return []
    return [
      ...found.entities.map(entity => ({
        id: entity.id,
        exp: entity.exp,
        entities: entity.mapsTo.reduce((entities, i) => ({[i.resource]: i.ids, ...entities}), {} as ResourceMap)
      })),
      ...found.interactors?.map(interactor => ({
        id: interactor.id,
        exp: interactor.exp,
        entities: {[interactor.interactsWith.resource]: interactor.interactsWith.ids},
        interactors: interactor.mapsTo,
      })) || []
    ];
  })


  resources = computed(() => this.pathwayFoundEntities.value()?.resources || [])
  resourceColumnIds = computed(() => this.resources().map(r => `entities-${r}`))
  expressionColumnNames = computed(() => this.analysis.result()?.expression?.columnNames || []);
  expressionColumnIds = computed(() => this.expressionColumnNames().map((_, i) => `exp-${i}`));

  expandedColumns = computed(() => this.pathwayFoundEntities.value() ? [
    'id',
    ...(this.analysis.hasInteractors() ? ['interactors'] : []),
    ...this.resourceColumnIds(),
    ...this.expressionColumnIds()
  ] : [])


}

function arrayToSortableString(values: string[] | undefined): string {
  if (!values) return '0';
  return `${values.length}-${values.join('-')}`;
}
