import {Component, computed, input} from '@angular/core';
import {AnalysisService} from "../../../../services/analysis.service";
import {MatTooltip} from "@angular/material/tooltip";
import {MatIcon} from "@angular/material/icon";
import {DecimalPipe} from "@angular/common";
import {ScientificNumberPipe} from "../../../../pipes/scientific-number.pipe";

type Label = { text: string, tooltip: string }

const gsaValueToLabel = new Map<number, Label>([
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

  pValue = input<number>(0)
  isPValue = input<boolean>(false)
  isSignificant = computed(() => ((this.isPValue() && this.value()) || this.pValue()) < 0.05)

  isGSA = input<boolean>(false)

  format = input<string>('1.3-3')

  scale = computed(() => this.isPValue() ? this.analysis.pValueScale().scale : this.analysis.palette().scale)
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

  constructor(private analysis: AnalysisService) {
  }

  protected readonly gsaValueToLabel = gsaValueToLabel;
}
