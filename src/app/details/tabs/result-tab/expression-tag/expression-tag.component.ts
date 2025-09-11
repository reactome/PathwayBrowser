import {Component, computed, input} from '@angular/core';
import {AnalysisService} from "../../../../services/analysis.service";
import {MatTooltip} from "@angular/material/tooltip";
import {MatIcon} from "@angular/material/icon";
import {DecimalPipe} from "@angular/common";
import {ScientificNumberPipe} from "../../../../pipes/scientific-number.pipe";
import {UrlStateService} from "../../../../services/url-state.service";
import {DarkService} from "../../../../services/dark.service";

type Label = { text: string, tooltip: string }

export const gsaValueToLabel = new Map<number, Label>([
    [2, {text: 'keyboard_double_arrow_up', tooltip: 'Significantly up regulated'}],
    [1, {text: 'keyboard_arrow_up', tooltip: 'Non-significantly up regulated'}],
    [0, {text: 'remove', tooltip: 'No regulation'}],
    [-1, {text: 'keyboard_arrow_down', tooltip: 'Non-significantly down regulated'}],
    [-2, {text: 'keyboard_double_arrow_down', tooltip: 'Significantly down regulated'}],
  ]
)

@Component({
  selector: 'cr-expression-tag',
  imports: [
    MatTooltip,
    MatIcon,
    DecimalPipe,
    ScientificNumberPipe
  ],
  templateUrl: './expression-tag.component.html',
  styleUrl: './expression-tag.component.scss'
})
export class ExpressionTagComponent {

  value = input.required<number>()
  scientificFormat = input.required<boolean>()

  fdr = input<number>(0)
  isFDR = input<boolean>(false)
  isSignificant = computed(() => ((this.isFDR() && this.value()) || this.fdr()) < this.state.significance())

  isRegulation = input<boolean>(false)

  format = input<string | undefined>('1.3-3')

  palette = computed(() => this.isFDR() && this.analysis.type() !== 'OVERREPRESENTATION' ? this.analysis.fdrPalette() : this.analysis.palette())
  scale = computed(() => {
    this.dark.isDark() // Update on dark change
    return this.palette().scale
  })
  color = computed(() => this.scale()(this.value()))
  onColor = computed(() => this.color().get('oklch.l') > 0.70 ? 'black' : 'white')
  style = computed(() => this.isSignificant() ? {
    'background': this.color().hex(),
    'color': this.onColor()
  } : {
    'background': 'var(--surface)',
    'color': 'var(--on-surface)',
    'border': `2px solid ${this.color().hex()}`
  })

  constructor(private analysis: AnalysisService, private state: UrlStateService, private dark: DarkService) {
  }

  protected readonly gsaValueToLabel = gsaValueToLabel;
}
