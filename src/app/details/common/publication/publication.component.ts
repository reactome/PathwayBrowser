import {Component, input} from '@angular/core';
import {LiteratureReference} from "../../../model/graph/publication/literature-reference.model";
import {Publication} from "../../../model/graph/publication/publication.model";

@Component({
    selector: 'cr-publication',
    templateUrl: './publication.component.html',
    styleUrl: './publication.component.scss',
    standalone: false
})
export class PublicationComponent{
  readonly ref = input.required<LiteratureReference | Publication>({ alias: "publication" });
  readonly showYear = input<boolean>(false);
  isExpanded = false;


  toggleAuthors() {
    this.isExpanded = !this.isExpanded;
  }
}
