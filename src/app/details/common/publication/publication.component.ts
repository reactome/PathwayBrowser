import {Component, input} from '@angular/core';
import {environment} from "../../../../environments/environment";
import {LiteratureReference} from "../../../model/graph/publication/literature-reference.model";

@Component({
    selector: 'cr-publication',
    templateUrl: './publication.component.html',
    styleUrl: './publication.component.scss',
    standalone: false
})
export class PublicationComponent{
  readonly ref = input.required<LiteratureReference>({ alias: "publication" });
  readonly showYear = input<boolean>(false);
  isExpanded = false;

  environment = environment.host

  toggleAuthors() {
    this.isExpanded = !this.isExpanded;
  }

  openPersonDetails(dbId :number) {
    const url = `${environment.host}/content/detail/person/${dbId}`;
    window.open(url, '_blank');
  }
}
