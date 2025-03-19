import {Component, input} from '@angular/core';
import {Regulation} from "../../../model/graph/Regulation/regulation.model";
import {DatabaseObject} from "../../../model/graph/database-object.model";
import {IconService} from "../../../services/icon.service";
import {RegulationReference} from "../../../model/graph/control-reference/regulation-reference.model";

@Component({
  selector: 'cr-regulation',
  standalone: false,
  templateUrl: './regulation.component.html',
  styleUrl: './regulation.component.scss'
})
export class RegulationComponent {
  readonly regulations = input.required<Regulation[]>({alias: 'regulations'});
  readonly regulationRefs = input.required<RegulationReference[]>({alias: 'regulationRefs'});


  constructor(private iconService: IconService) {
  }

  getSymbol(obj: DatabaseObject) {
    return this.iconService.getIconDetails(obj);
  }
}
