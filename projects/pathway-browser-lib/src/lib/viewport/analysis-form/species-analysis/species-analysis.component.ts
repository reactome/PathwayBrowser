import {Component, computed, effect, ElementRef, input, output, signal, viewChild} from '@angular/core';
import {MatStep, MatStepper, MatStepperNext, MatStepperPrevious} from "@angular/material/stepper";
import {MatButton} from "@angular/material/button";
import type {DotLottie} from "@lottiefiles/dotlottie-web";
import {MatIcon} from "@angular/material/icon";
import {UrlStateService} from "../../../services/url-state.service";
import {AnalysisService} from "../../../services/analysis.service";
import {Species} from "../../../model/graph/species.model";
import {SpeciesService} from "../../../services/species.service";
import {FormControl} from "@angular/forms";
import {LottieService} from "../../../services/lottie.service";
import {MatRipple} from "@angular/material/core";
import {MatTooltip} from "@angular/material/tooltip";
import {switchMap, take} from "rxjs";
import {DarkService} from "../../../services/dark.service";

@Component({
  selector: 'cr-species-analysis',
  imports: [
    MatStep,
    MatStepper,
    MatButton,
    MatIcon,
    MatStepperPrevious,
    MatRipple,
    MatStepperNext,
    MatTooltip
  ],
  templateUrl: './species-analysis.component.html',
  styleUrl: './species-analysis.component.scss'
})
export class SpeciesAnalysisComponent {
  close = output<{ status: 'finished' | 'premature' }>()
  status = input.required<'open'| 'closed'>()

  lottieCanvas = viewChild<ElementRef<HTMLCanvasElement>>('lottie')

  comparableSpecies = computed(() => (this.speciesService.allShortenSpecies() || []).filter(s => s.taxId !== '9606'));
  selectedSpecies = signal<Species | null>(null)
  speciesControl = new FormControl<Species | null>(null, control => control.getRawValue() !== undefined ? null : {invalid: true});

  toggle(species: Species): void {
    this.selectedSpecies.update(s => s === species ? null : species)
  }

  theme = computed(() => this.darkService.isDark() ? 'dark' : 'light')


  constructor(
    private analysis: AnalysisService,
    private state: UrlStateService,
    private speciesService: SpeciesService,
    private lottieService: LottieService,
    private darkService: DarkService,
  ) {
    effect(() => this.speciesControl.setValue(this.selectedSpecies()));
    effect(async () => {
      if (!this.lottieCanvas() || this.lottie) return;
      this.lottie = await this.lottieService.buildLottie({
        renderConfig: {
          autoResize: true,
          freezeOnOffscreen: true
        },
        autoplay: true,
        loop: !this.analysisAvailable(),
        canvas: this.lottieCanvas()!.nativeElement,
        src: `assets/animations/${this.theme()}/${this.analysisAvailable() ? 'success' : 'loader'}-animation.json`
      })
    });

    effect(() => {
      const [theme, analysisLaunched, analysisAvailable] = [this.theme(), this.analysisLaunched(), this.analysisAvailable()];
      if (analysisLaunched && this.lottie) {
        this.lottie.load({
          src: `assets/animations/${theme}/${analysisAvailable ? 'success' : 'loader'}-animation.json`,
          loop: !analysisAvailable,
          autoplay: true
        })
      }
    });

    effect(() => {
      if (this.status() === 'open' && this.lottie) setTimeout(() => this.lottie!.play(), 800);
    });
  }

  protected readonly Math = Math;

  lottie?: DotLottie;
  token: string | null = null;

  analysisLaunched = signal(false)
  analysisAvailable = signal(false)

  analyse() {
    if (this.selectedSpecies() === null) return
    this.analysisLaunched.set(true);
    this.analysisAvailable.set(false);
    this.analysis.analyseSpecies(this.selectedSpecies()!).subscribe((result) => {
      this.analysisAvailable.set(true);
      this.token = result.summary.token;
      this.close.emit({status: 'finished'})
    })
  }

  loadAnalysis() {
    this.state.analysis.set(this.token);
    this.close.emit({status: 'finished'});
  }
}
