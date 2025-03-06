import {Component, computed, input} from '@angular/core';
import {ReferenceEntity} from "../../../model/graph/reference-entity/reference-entity.model";
import {EntitiesService} from "../../../services/entities.service";
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

    return this.entitiesService.getTransformedExternalRef(ref);
  });


  constructor(private entitiesService: EntitiesService) {
  }

  protected readonly isString = isString;
  protected readonly isArray = isArray;
}
