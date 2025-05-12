import {Component, computed, effect, input} from '@angular/core';
import {MatTooltip} from "@angular/material/tooltip";
import {TitleCasePipe} from "@angular/common";
import {DatabaseObject} from "../../../model/graph/database-object.model";

export type OntologyTerm = DatabaseObject & {
  name?: string[] | string;
  url: string,
  databaseName: string,
  definition?: string;
  identifier?: string;
  accession?: string;
};

@Component({
  selector: 'cr-ontology-term',
  imports: [
    MatTooltip,
    TitleCasePipe
  ],
  templateUrl: './ontology-term.component.html',
  styleUrl: './ontology-term.component.scss',
})
export class OntologyTermComponent {
  term = input.required<OntologyTerm>();
  titleCase = input<boolean>(false);
  displayId = input<boolean>(true);

  name = computed(() => this.term().displayName || (this.term().name instanceof Array ? this.term().name![0] : this.term().name as string));
  id = computed(() => this.term().identifier! || this.term().accession!);

  constructor() {
    effect(() => console.log(this.term()));
  }
}
