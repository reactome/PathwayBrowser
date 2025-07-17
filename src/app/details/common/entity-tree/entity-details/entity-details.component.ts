import {Component, computed, input} from '@angular/core';
import {ReferenceEntity} from "../../../../model/graph/reference-entity/reference-entity.model";
import {SelectableObject} from "../../../../services/event.service";
import {isPhysicalEntity} from "../../../../services/utils";
import {DatabaseIdentifier} from "../../../../model/graph/database-identifier.model";
import {StructureViewerComponent} from "../../../tabs/molecule-tab/structure-viewer/structure-viewer.component";
import {MatDivider} from "@angular/material/divider";
import {DescriptionOverviewComponent} from "../../description-overview/description-overview.component";
import {ExternalReferenceComponent} from "../../external-reference/external-reference.component";
import {CrossReferencesComponent} from "../../cross-references/cross-references.component";

@Component({
  selector: 'cr-entity-details',
  imports: [
    StructureViewerComponent,
    MatDivider,
    DescriptionOverviewComponent,
    ExternalReferenceComponent,
    CrossReferencesComponent
  ],
  templateUrl: './entity-details.component.html',
  styleUrl: './entity-details.component.scss'
})
export class EntityDetailsComponent {

  readonly obj = input.required<SelectableObject>();

  readonly className = input.required<string>();

  readonly refEntity = input.required<ReferenceEntity>();

  readonly xRefs = input.required<DatabaseIdentifier[]>();


}
