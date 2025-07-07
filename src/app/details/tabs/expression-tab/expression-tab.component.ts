import {Component, effect} from '@angular/core';
import {EntitiesService} from "../../../services/entities.service";


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

 // readonly obj = input.required<SelectableObject>();
  gxaQueries: GXAQuery[] | null = null;

  constructor(private entity: EntitiesService) {
    effect(() => {
     // if (!this.obj()) return;
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
