import {Component, input, output} from '@angular/core';
import {MatAnchor} from "@angular/material/button";
import {MatIcon} from "@angular/material/icon";
import {MatTooltip} from "@angular/material/tooltip";

@Component({
  selector: 'cr-download-button',
  imports: [
    MatAnchor,
    MatTooltip,
    MatIcon,

  ],
  templateUrl: './download-button.component.html',
  styleUrl: './download-button.component.scss'
})
export class DownloadButtonComponent {

  url = input<string>();
  download = input<string | boolean>();
  icon = input<string>();
  label = input<string>();
  tooltip = input<string>();
  openInNewTab = input<string>('_blank');
  click = output<void>();

  onClick(event: MouseEvent) {
    event.stopPropagation();
    this.click.emit();
  }
}
