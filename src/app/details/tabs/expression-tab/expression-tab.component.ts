import {Component, effect} from '@angular/core';
import {EntityService} from "../../../services/entity.service";


// Global variable avoid typescript errors
declare const expressionAtlasHeatmapHighcharts: any;

type GXAQuery = { value: string };


@Component({
  selector: 'cr-expression-tab',
  standalone: false,
  templateUrl: './expression-tab.component.html',
  styleUrl: './expression-tab.component.scss'
})
export class ExpressionTabComponent {

  readonly obj = input.required<SelectableObject>();
  gxaQueries: GXAQuery[] | null = null;

  constructor(private entity: EntityService) {
    effect(() => {
      const selectedEvent = this.obj().stId;
      this.entity.loadRefEntities(selectedEvent);
      const data = this.entity.refEntities();

      this.gxaQueries = Array.isArray(data) ? data.map(entity => ({value: entity.identifier})) : null;

      if (this.gxaQueries) {
        expressionAtlasHeatmapHighcharts.render({
          target: 'expressionContainer',
          experiment: 'reference',
          query: {
            // species: 'homo sapiens',
            gene: this.gxaQueries
          }
        });
      }
    });
  }


}
