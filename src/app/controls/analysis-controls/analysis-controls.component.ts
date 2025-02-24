import {Component, computed} from '@angular/core';
import {AnalysisService, PaletteSummary} from "../../services/analysis.service";
import {MatIconButton} from "@angular/material/button";
import {MatIcon} from "@angular/material/icon";
import {UrlStateService} from "../../services/url-state.service";
import {DecimalPipe, NgTemplateOutlet} from "@angular/common";
import {animate, style, transition, trigger} from "@angular/animations";
import {MatTooltip} from "@angular/material/tooltip";

@Component({
  selector: 'cr-analysis-controls',
  imports: [
    MatIconButton,
    MatIcon,
    NgTemplateOutlet,
    DecimalPipe,
    MatTooltip
  ],
  templateUrl: './analysis-controls.component.html',
  styleUrl: './analysis-controls.component.scss',
  animations: [
    trigger('selectAnim', [
      transition(':enter', [
        style({height: '0'}),
        animate('500ms ease-in-out', style({height: '*'})),
      ]),
      transition(':leave', [
        animate('500ms ease-in-out', style({height: '0'})),
      ])
    ])
  ]
})
export class AnalysisControlsComponent {

  selectingPalette = false;

  interval?: number
  isFirstProfile = computed(() => this.analysis.sampleIndex() === 0)
  isLastProfile = computed(() => this.analysis.sampleIndex() >= this.analysis.samples().length - 1)
  hasMultipleProfile = computed(() => this.analysis.samples().length > 1);
  maxLengthProfile = computed(() => this.analysis.samples().reduce((a, b) => a.length > b.length ? a : b, ''));

  constructor(public analysis: AnalysisService, public state: UrlStateService) {
  }

  previousProfile() {
    this.updateProfile(this.analysis.sampleIndex() - 1)
  }

  nextProfile() {
    this.updateProfile(this.analysis.sampleIndex() + 1)
  }

  clear() {
    this.pause()
    this.analysis.clearAnalysis()
  }

  updateProfile(index: number) {
    this.analysis.sampleIndex.set(index)
    this.state.sample.set(this.analysis.samples()[index])
  }

  selectPalette(palette: PaletteSummary) {
    this.analysis.palette.set(palette);
    this.selectingPalette = false;
  }

  toggleIterate() {
    if (this.interval === undefined) {
      this.play();
    } else {
      this.pause();
    }
  }

  play() {
    this.interval = window.setInterval(this.iterate.bind(this), 1000);
  }

  pause() {
    window.clearInterval(this.interval);
    this.interval = undefined;
  }

  iterate() {
    if (!this.isLastProfile()) this.nextProfile();
    else this.updateProfile(0)
  }
}
