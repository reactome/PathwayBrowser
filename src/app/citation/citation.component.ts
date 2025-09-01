import {Component, computed, inject, signal} from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogTitle
} from "@angular/material/dialog";
import {Citation, CitationService} from "../services/citation.service";
import {DownloadButtonComponent} from "../details/tabs/download-tab/download-button/download-button.component";
import {MatAnchor, MatButton, MatIconButton} from "@angular/material/button";
import {MatIcon} from "@angular/material/icon";
import {CdkCopyToClipboard} from "@angular/cdk/clipboard";
import {FormsModule} from "@angular/forms";


@Component({
  selector: 'cr-citation',
  imports: [
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
    MatDialogTitle,
    DownloadButtonComponent,
    MatIcon,
    MatIconButton,
    CdkCopyToClipboard,
    MatButton,
    FormsModule,
    MatAnchor
  ],
  templateUrl: './citation.component.html',
  styleUrl: './citation.component.scss'
})
export class CitationComponent {

  data: Citation = inject(MAT_DIALOG_DATA);

  id = this.data.id
  citationContent =  this.data.content
  downloadItems = this.data.downloadItems

  copyLabel = signal('Copy');
  copyIcon = signal('content_copy');


  staticCitation = computed(() => {
    return !this.citation.isPathwayCitation(this.citationContent()) ? this.citationContent() : null;
  });

  imageCitation = computed(() => {
    const content = this.citationContent();
    return this.citation.isPathwayCitation(content) ? content.imageCitation : null;
  });

  pathwayCitation = computed(() => {
    const content = this.citationContent();
    return this.citation.isPathwayCitation(content) ? content.pathwayCitation : null;
  });

  citationToCopy = computed(() => {
    if (this.staticCitation()) return this.staticCitation() as string ?? '';
    const content = [];
    if (this.pathwayCitation()) content.push("Pathway: " + this.pathwayCitation());
    if (this.imageCitation()) content.push("Image: " + this.imageCitation());
    return content.join('\n');
  });

  citationToMail = computed(() => encodeURI(this.citationToCopy()));

  constructor(public citation: CitationService) {
  }

  onCopyClick() {
    this.copyLabel.set('Copied');
    this.copyIcon.set('done');
  }
}
