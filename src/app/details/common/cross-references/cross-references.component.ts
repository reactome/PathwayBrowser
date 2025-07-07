import {Component, computed, input} from '@angular/core';
import {EntityService} from "../../../services/entity.service";
import {DatabaseIdentifier} from "../../../model/graph/database-identifier.model";

@Component({
  selector: 'cr-cross-references',
  templateUrl: './cross-references.component.html',
  styleUrl: './cross-references.component.scss',
  standalone: false
})
export class CrossReferencesComponent {
  readonly _crossReferences = input.required<DatabaseIdentifier[]>({alias: 'crossRefs'});

  readonly crossReferences = computed(() => {

    if (this._crossReferences().length == 0) return new Map<string, DatabaseIdentifier[]>();
    const crossRefs = [...this._crossReferences()];
    return this.entity.getGroupedData(crossRefs, ref => ref.databaseName);
  });

  constructor(private entity: EntityService) {

  }
}
