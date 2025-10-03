import {effect, Injectable, signal} from '@angular/core';
import {Figure} from "../../../../model/graph/figure.model";
import {DataStateService} from "../../../../services/data-state.service";

@Injectable({
  providedIn: 'root'
})
export class FigureService {

  readonly expanded = signal<Figure | undefined>(undefined)

  toggle(figure: Figure) {
    this.expanded.update(prev => prev === figure ? undefined : figure);
  }


  constructor(private data: DataStateService) {
    effect(() => {
      this.data.selectedElement() && this.expanded.set(undefined); // reset expanded when element changes
    });
  }
}
