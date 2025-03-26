import {Component, input} from '@angular/core';
import {Relationship} from "../../../model/graph/relationship.model";
import {hasProperty, isEntity, isReferenceGroup} from "../../../services/utils";
import {DatabaseObject} from "../../../model/graph/database-object.model";
import {IconService} from "../../../services/icon.service";
import HasModifiedResidue = Relationship.HasModifiedResidue;
import {DatabaseObjectService} from "../../../services/database-object.service";


@Component({
  selector: 'cr-modification',
  standalone: false,
  templateUrl: './modification.component.html',
  styleUrl: './modification.component.scss'
})
export class ModificationComponent {

  modifications = input.required<HasModifiedResidue[]>({alias: 'modifications'})


  constructor(private iconService: IconService) {
  }

  getSymbol(obj: DatabaseObject) {
    return this.iconService.getIconDetails(obj);
  }

  getModification(element: DatabaseObject) {
    if (hasProperty(element, 'modification') && element.modification) {
      const mod = element.modification as DatabaseObject;
      if (isReferenceGroup(mod)) {
        return mod;
      }
      if (isEntity(mod)) {
        return mod;
      }
    }
    return null;
  }

  protected readonly isReferenceGroup = isReferenceGroup;
  protected readonly isEntity = isEntity;
  protected readonly hasProperty = hasProperty;
  protected readonly DatabaseObjectService = DatabaseObjectService;
}
