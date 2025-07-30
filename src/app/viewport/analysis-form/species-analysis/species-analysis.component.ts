import {Component, computed, effect, ElementRef, output, signal, viewChild} from '@angular/core';
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
  lottieCanvas = viewChild<ElementRef<HTMLCanvasElement>>('lottie')

  comparableSpecies = computed(() => (this.speciesService.allShortenSpecies() || []).filter(s => s.taxId !== '9606'));
  selectedSpecies = signal<Species | null>(null)
  speciesControl = new FormControl<Species | null>(null, control => control.getRawValue() !== undefined ? null : {invalid: true});

  toggle(species: Species): void {
    this.selectedSpecies.update(s => s === species ? null : species)
  }

  constructor(
    private analysis: AnalysisService,
    private state: UrlStateService,
    private speciesService: SpeciesService,
    private lottieService: LottieService,
  ) {
    effect(() => this.speciesControl.setValue(this.selectedSpecies()));
    effect(async () => {
      if (!this.lottieCanvas()) return;
      this.lottie = await this.lottieService.buildLottie({
        autoplay: true,
        loop: true,
        canvas: this.lottieCanvas()!.nativeElement,
        src: "assets/animations/loading-ripple.lottie"
      })
    });
  }

  protected readonly Math = Math;

  lottie?: DotLottie;
  analysisLaunched = false
  token: string | null = null;

  analyse() {
    if (this.selectedSpecies() === null) return
    this.lottie?.load({src: "assets/animations/loading-ripple.lottie", loop: true, autoplay: true})
    this.analysisLaunched = true;
    this.analysis.analyseSpecies(this.selectedSpecies()!).subscribe((result) => {
      this.lottie!.load({src: 'assets/animations/success-animation.json', loop: true, autoplay: true})
      this.token = result.summary.token;
      this.close.emit({status: 'finished'})
    })
  }

  loadAnalysis() {
    this.state.analysis.set(this.token);
    this.close.emit({status: 'finished'});
  }
}
