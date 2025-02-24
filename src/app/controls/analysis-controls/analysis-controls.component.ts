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

  hasMultipleProfile = computed(() => this.analysis.profiles().length > 1);

  maxLengthProfile = computed(() => this.analysis.profiles().reduce((a, b) => a.length > b.length ? a : b, ''));

  constructor(public analysis: AnalysisService, public state: UrlStateService) {
  }

  previousProfile() {
    this.updateProfile(this.analysis.profileIndex() - 1)
  }

  nextProfile() {
    this.updateProfile(this.analysis.profileIndex() + 1)
  }

  clear() {
    this.analysis.clearAnalysis()
  }

  updateProfile(index: number) {
    this.analysis.profileIndex.set(index)
    this.state.analysisProfile.set(this.analysis.profiles()[index])
  }

  selectPalette(palette: PaletteSummary) {
    this.analysis.palette.set(palette);
    this.selectingPalette = false;

    console.table(palette.colors.map(c => c.oklch()))
  }
}
