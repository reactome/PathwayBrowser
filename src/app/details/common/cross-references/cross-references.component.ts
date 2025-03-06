import {Component, computed, input, InputSignal} from '@angular/core';
import {ReferenceEntity} from "../../../model/graph/reference-entity/reference-entity.model";
import {EntitiesService} from "../../../services/entities.service";

@Component({
  selector: 'cr-cross-references',
  templateUrl: './cross-references.component.html',
  styleUrl: './cross-references.component.scss',
  standalone: false
})
export class CrossReferencesComponent {
  readonly referenceEntity = input.required<ReferenceEntity>();
  readonly crossReferences = computed(() => this.entitiesService.getGroupedCrossReferences(this.referenceEntity()));

  constructor(private entitiesService: EntitiesService) {

  }
}
