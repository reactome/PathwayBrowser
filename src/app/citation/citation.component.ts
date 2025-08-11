import {Component, computed, inject} from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogTitle
} from "@angular/material/dialog";
import {MatButton} from "@angular/material/button";
import {CitationService} from "../services/citation.service";


@Component({
  selector: 'cr-citation',
  imports: [
    MatDialogContent,
    MatDialogActions,
    MatButton,
    MatDialogClose,
    MatDialogTitle
  ],
  templateUrl: './citation.component.html',
  styleUrl: './citation.component.scss'
})
export class CitationComponent {

  data = inject(MAT_DIALOG_DATA);

  citationContent = computed(() => this.data.citationData.value());
  id = computed(() => this.data.id());

  staticCitation = computed(() => {
    return this.citation.isStatic() ? this.citationContent() : null
  });

  imageCitation = computed(() => {
    return !this.citation.isStatic() ? this.citationContent().imageCitation : null;
  });

  pathwayCitation = computed(() => {
    return !this.citation.isStatic() ? this.citationContent().pathwayCitation : null;
  });

  constructor(public citation: CitationService) {
  }

  export() {

  }
}
