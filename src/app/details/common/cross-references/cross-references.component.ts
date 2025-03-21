import {Component, computed, input} from '@angular/core';
import {ReferenceEntity} from "../../../model/graph/reference-entity/reference-entity.model";
import {EntitiesService} from "../../../services/entities.service";
import {DatabaseIdentifier} from "../../../model/graph/database-identifier.model";

@Component({
  selector: 'cr-cross-references',
  templateUrl: './cross-references.component.html',
  styleUrl: './cross-references.component.scss',
  standalone: false
})
export class CrossReferencesComponent {
  readonly referenceEntity = input.required<ReferenceEntity>();

  readonly crossReferences = computed(() => {
    const referenceEntity = this.referenceEntity();
    if (!referenceEntity || !referenceEntity.crossReference) return new Map<string, DatabaseIdentifier[]>();
    const crossRefs = [...referenceEntity.crossReference];
    return this.entitiesService.getGroupedData(crossRefs, ref => ref.databaseName);
  });

  constructor(private entitiesService: EntitiesService) {

  }
}
