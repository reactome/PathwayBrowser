import {Component, effect, input} from '@angular/core';
import {SelectableObject} from "../../../services/event.service";
import {EntitiesService} from "../../../services/entities.service";


// Global variable avoid typescript errors
declare const expressionAtlasHeatmapHighcharts: any;

type GXAQuery = { value: string };


@Component({
  selector: 'cr-expression',
  standalone: false,
  templateUrl: './expression.component.html',
  styleUrl: './expression.component.scss'
})
export class ExpressionComponent {

  readonly obj = input.required<SelectableObject>();
  gxaQueries: GXAQuery[] | null = null;

  constructor(private entity: EntitiesService) {
    effect(() => {

      const selectedEvent = this.obj().stId;
      this.entity.loadRefEntities(selectedEvent);
      const data = this.entity.refEntities();
      const value = data();
      this.gxaQueries = Array.isArray(value) ? value.map(entity => ({value: entity.identifier})) : null;

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
