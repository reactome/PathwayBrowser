import {Component, input} from '@angular/core';
import {LiteratureReference} from "../../../model/graph/publication/literature-reference.model";
import {Publication} from "../../../model/graph/publication/publication.model";
import {SafePipe} from "../../../pipes/safe.pipe";
import {MatIcon} from "@angular/material/icon";


@Component({
  selector: 'cr-publication',
  templateUrl: './publication.component.html',
  imports: [
    SafePipe,
    MatIcon
],
  styleUrl: './publication.component.scss'
})
export class PublicationComponent{
  readonly ref = input.required<LiteratureReference | Publication>({ alias: "publication" });
  readonly showYear = input<boolean>(false);
  isExpanded = false;


  toggleAuthors() {
    this.isExpanded = !this.isExpanded;
  }
}
