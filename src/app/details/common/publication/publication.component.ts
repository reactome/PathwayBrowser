import {Component, Input} from '@angular/core';
import {environment} from "../../../../environments/environment";
import {LiteratureReference} from "../../../model/graph/publication/literature-reference.model";

@Component({
  selector: 'cr-publication',
  templateUrl: './publication.component.html',
  styleUrl: './publication.component.scss'
})
export class PublicationComponent{
  @Input('publication') ref!: LiteratureReference;
  @Input('showYear') showYear: boolean = false;
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
