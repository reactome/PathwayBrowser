import {Component, computed, input} from '@angular/core';
import {AnalysisService, PaletteName} from "../../services/analysis.service";
import {UrlStateService} from "../../services/url-state.service";
import {DecimalPipe, NgTemplateOutlet} from "@angular/common";
import {animate, style, transition, trigger} from "@angular/animations";
import {MatTooltip} from "@angular/material/tooltip";
import {MatIcon} from "@angular/material/icon";
import {getArrayStats} from "../../services/utils";

@Component({
  selector: 'cr-analysis-legend',
  imports: [
    NgTemplateOutlet,
    MatTooltip,
    MatIcon,
    DecimalPipe
  ],
  templateUrl: './analysis-legend.component.html',
  styleUrl: './analysis-legend.component.scss',
  animations: [
    trigger('selectAnim', [
      transition(':enter', [
        style({width: '0'}),
        animate('500ms ease-in-out', style({width: '*'})),
      ]),
      transition(':leave', [
        animate('500ms ease-in-out', style({width: '0'})),
      ])
    ])
  ]
})
export class AnalysisLegendComponent {

  radius = input(10);
  viewBox = computed(() => `0 -1 ${this.radius() * 2} ${this.radius()}`)
  d = computed(() =>
    `M -1 0
    h 1
    a ${this.radius()} ${this.radius()} 0 0 1 ${this.radius()} ${this.radius()}
    a ${this.radius()} ${this.radius()} 0 0 1 ${this.radius()} -${this.radius()}
    h 1
    v -3
    H 0
    Z`)

  floating = input(true);
  //TODO support values representation
  values = input<number[]>([]);
  valuesStats = computed(() => getArrayStats(this.values()))
  name = computed(() => this.state.sample() || "pValue")

  selectingPalette = false;

  constructor(public analysis: AnalysisService, public state: UrlStateService) {
  }

  selectPalette(palette: PaletteName) {
    this.state.palette.set(palette);
    this.selectingPalette = false;
  }
}
