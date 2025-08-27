import {Component, computed, input} from '@angular/core';
import {ReferenceEntity} from "../../../model/graph/reference-entity/reference-entity.model";
import {EntityService} from "../../../services/entity.service";
import {isArray, isString} from "lodash";
import {NgClass, TitleCasePipe} from "@angular/common";
import {MatIconButton} from "@angular/material/button";
import {MatIcon} from "@angular/material/icon";
import {UrlStateService} from "../../../services/url-state.service";
import {MatTooltip} from "@angular/material/tooltip";
import {DataStateService} from "../../../services/data-state.service";

@Component({
  selector: 'cr-external-reference',
  templateUrl: './external-reference.component.html',
  styleUrl: './external-reference.component.scss',
  imports: [
    TitleCasePipe,
    NgClass,
    MatIcon,
    MatIconButton,
    MatTooltip,
  ]
})
export class ExternalReferenceComponent {

  readonly referenceEntity = input.required<ReferenceEntity>();


  externalRef = computed(() => {

    const ref = this.referenceEntity();
    if (!ref) return [];

    return this.entity.getTransformedExternalRef(ref);
  });


  constructor(private entity: EntityService, private state: UrlStateService, public data: DataStateService ) {
  }

  protected readonly isString = isString;
  protected readonly isArray = isArray;

  onSelect() {
    this.state.select.set(this.referenceEntity().stId!)
  }
}
