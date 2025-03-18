import {Component, input} from '@angular/core';
import {DatabaseObject} from "../../../model/graph/database-object.model";


@Component({
  selector: 'cr-controller-tree',
  templateUrl: './controller-tree.component.html',
  styleUrl: './controller-tree.component.scss',
  standalone: false
})
export class ControllerTreeComponent<E extends DatabaseObject> {


  readonly type = input.required<string>();
  readonly depthControl = input.required<boolean>();
  readonly data = input.required<E[]>();

  length = 8; // Total pages
  depthIndex = 1; // Start from Page 1


  firstPage() {
    this.depthIndex = 1;
  }

  previousPage() {
    if (this.depthIndex > 1) {
      this.depthIndex--;
    }
  }

  nextPage() {
    if (this.depthIndex < this.length) {
      this.depthIndex++;
    }
  }

  lastPage() {
    this.depthIndex = this.length;
  }

}
