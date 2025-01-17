import {Component, Input} from '@angular/core';
import {LiteratureReference} from "../../../model/event.model";
import {environment} from "../../../../environments/environment";

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
