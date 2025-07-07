import {Component, computed, input} from '@angular/core';
import {ReferenceEntity} from "../../../model/graph/reference-entity/reference-entity.model";
import {EntityService} from "../../../services/entity.service";
import {isArray, isString} from "lodash";

@Component({
  selector: 'cr-external-reference',
  templateUrl: './external-reference.component.html',
  styleUrl: './external-reference.component.scss',
  standalone: false
})
export class ExternalReferenceComponent {

  readonly referenceEntity = input.required<ReferenceEntity>({alias: "referenceEntity"});


  externalRef = computed(() => {

    const ref = this.referenceEntity();
    if (!ref) return [];

    return this.entity.getTransformedExternalRef(ref);
  });


  constructor(private entity: EntityService) {
  }

  protected readonly isString = isString;
  protected readonly isArray = isArray;
}
