import {Component, Input} from '@angular/core';
import {LiteratureReference} from "../../../model/event.model";

@Component({
  selector: 'cr-publication',
  templateUrl: './publication.component.html',
  styleUrl: './publication.component.scss'
})
export class PublicationComponent {
  @Input('publication') ref?: LiteratureReference;
}
