import {Injectable, signal} from '@angular/core';
import {Figure} from "../../../../model/graph/figure.model";

@Injectable({
  providedIn: 'root'
})
export class FigureService {

  readonly expanded = signal<Figure | undefined>(undefined)

  toggle(figure: Figure) {
    this.expanded.update(prev => prev === figure ? undefined : figure);
  }


  constructor() { }
}
