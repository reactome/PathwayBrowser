import {Component, input} from '@angular/core';
import {Relationship} from "../../../model/graph/relationship.model";
import HasModifiedResidue = Relationship.HasModifiedResidue;
import {hasModification, isEntity, isReferenceGroup} from "../../../services/utils";

@Component({
  selector: 'cr-modification',
  standalone: false,
  templateUrl: './modification.component.html',
  styleUrl: './modification.component.scss'
})
export class ModificationComponent {

  modifications = input.required<HasModifiedResidue[]>({alias: 'modifications'})

  protected readonly isReferenceGroup = isReferenceGroup;
  protected readonly isEntity = isEntity;
  protected readonly hasModification = hasModification;
}
