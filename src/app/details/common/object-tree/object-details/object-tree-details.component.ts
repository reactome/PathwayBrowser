import {ChangeDetectionStrategy, Component, input, OnDestroy, OnInit} from '@angular/core';
import {ReferenceEntity} from "../../../../model/graph/reference-entity/reference-entity.model";
import {SelectableObject} from "../../../../services/event.service";
import {DatabaseIdentifier} from "../../../../model/graph/database-identifier.model";
import {StructureViewerComponent} from "../../../tabs/molecule-tab/structure-viewer/structure-viewer.component";
import {MatDivider} from "@angular/material/divider";
import {DescriptionOverviewComponent} from "../../../tabs/description-tab/description-overview/description-overview.component";
import {ExternalReferenceComponent} from "../../external-reference/external-reference.component";
import {CrossReferencesComponent} from "../../cross-references/cross-references.component";
import {MoleculeType} from "../../../tabs/molecule-tab/molecule-details/molecule-details.component";

@Component({
  selector: 'cr-object-tree-details',
  imports: [
    StructureViewerComponent,
    MatDivider,
    DescriptionOverviewComponent,
    ExternalReferenceComponent,
    CrossReferencesComponent
  ],
  templateUrl: './object-tree-details.component.html',
  styleUrl: './object-tree-details.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ObjectTreeDetailsComponent {

  readonly obj = input.required<SelectableObject>();

  readonly className = input.required<string>();

  readonly refEntity = input.required<ReferenceEntity>();

  readonly xRefs = input.required<DatabaseIdentifier[]>();


  protected readonly MoleculeType = MoleculeType;
}
