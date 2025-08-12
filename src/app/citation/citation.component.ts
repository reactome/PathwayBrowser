import {Component, computed, inject} from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogTitle
} from "@angular/material/dialog";
import {Citation, CitationService} from "../services/citation.service";
import {DownloadButtonComponent} from "../details/tabs/download-tab/download-button/download-button.component";
import {MatButton} from "@angular/material/button";


@Component({
  selector: 'cr-citation',
  imports: [
    MatDialogContent,
    MatDialogActions,
    MatButton,
    MatDialogClose,
    MatDialogTitle,
    DownloadButtonComponent,
    MatButton,
  ],
  templateUrl: './citation.component.html',
  styleUrl: './citation.component.scss'
})
export class CitationComponent {

  data: Citation = inject(MAT_DIALOG_DATA);

  citationContent = computed(() => this.data.content());
  id = computed(() => this.data.id());
  downloadItems = computed(() => this.data.downloadItems());


  staticCitation = computed(() => {
    return !this.citation.isPathwayCitation(this.citationContent()) ? this.citationContent() : null
  });

  imageCitation = computed(() => {
    const content = this.citationContent();
    return this.citation.isPathwayCitation(content) ? content.imageCitation : null;
  });

  pathwayCitation = computed(() => {
    const content = this.citationContent();
    return this.citation.isPathwayCitation(content) ? content.pathwayCitation : null;
  });

  constructor(public citation: CitationService) {
  }

}
