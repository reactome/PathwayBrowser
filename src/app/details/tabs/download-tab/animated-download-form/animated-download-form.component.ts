import {Component, computed, signal} from '@angular/core';
import {MatDialogActions, MatDialogClose, MatDialogContent, MatDialogTitle} from "@angular/material/dialog";
import {MatButton} from "@angular/material/button";
import {defaultDownloadOptions, DownloadOptions} from "../../../../services/download.service";
import {MatCheckbox} from "@angular/material/checkbox";
import {FormsModule} from "@angular/forms";
import {MatError, MatFormField, MatLabel, MatSuffix} from "@angular/material/select";
import {MatInput} from "@angular/material/input";
import {MatSlideToggle} from "@angular/material/slide-toggle";

@Component({
  selector: 'cr-animated-download-form',
  imports: [
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
    MatButton,
    FormsModule,
    MatFormField,
    MatInput,
    MatLabel,
    MatSuffix,
    MatError,
    MatSlideToggle
  ],
  templateUrl: './animated-download-form.component.html',
  styleUrl: './animated-download-form.component.scss'
})
export class AnimatedDownloadFormComponent {
  includeTimeline = signal(defaultDownloadOptions.includeTimeline)
  includeLegend = signal(defaultDownloadOptions.includeLegend)
  timePerFrame = signal(defaultDownloadOptions.timePerFrame)
  transitionTime = signal(defaultDownloadOptions.transitionTime)

  options = computed<DownloadOptions>(() => ({
    animate: true,
    includeTimeline: this.includeTimeline(),
    includeLegend: this.includeLegend(),
    timePerFrame: this.timePerFrame(),
    transitionTime: this.transitionTime()
  }))
}
