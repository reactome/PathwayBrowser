import {Component, computed, effect, ElementRef, linkedSignal, output, signal, viewChild} from '@angular/core';
import {MatFormField, MatLabel, MatOption, MatSelect} from "@angular/material/select";
import {TissueExperimentService} from "./tissue-experiment/tissue-experiment.service";
import {MatProgressSpinner} from "@angular/material/progress-spinner";
import {MatTooltip} from "@angular/material/tooltip";
import {TissueExperiment} from "./tissue-experiment/tissue-experiment.model";
import {AnalysisService} from "../../../services/analysis.service";
import type {DotLottie} from "@lottiefiles/dotlottie-web";
import {LottieService} from "../../../services/lottie.service";
import {CdkDrag, CdkDragDrop, CdkDropList, moveItemInArray, transferArrayItem} from "@angular/cdk/drag-drop";
import {MatButton, MatIconButton} from "@angular/material/button";
import {MatIcon} from "@angular/material/icon";
import {add} from "vectorious";
import {animate, group, sequence, style, transition, trigger} from "@angular/animations";
import Summary = TissueExperiment.Summary;
import {MatStep, MatStepper, MatStepperNext, MatStepperPrevious} from "@angular/material/stepper";
import {FormBuilder, FormControl} from "@angular/forms";
import {AsyncPipe} from "@angular/common";
import {UrlStateService} from "../../../services/url-state.service";
import {DarkService} from "../../../services/dark.service";

@Component({
  selector: 'cr-tissue-analysis',
  imports: [
    MatSelect,
    MatProgressSpinner,
    MatOption,
    MatTooltip,
    MatLabel,
    MatFormField,
    CdkDropList,
    CdkDrag,
    MatIcon,
    MatIconButton,
    MatStepper,
    MatStep,
    MatButton,
    MatStepperNext,
    MatStepperPrevious
  ],
  templateUrl: './tissue-analysis.component.html',
  styleUrl: './tissue-analysis.component.scss',
  animations: [
    trigger('left-column', [
      transition(':enter', [
        style({
          transform: 'translateX(100%)',
          border: '1px solid var(--outline)',
          borderTop: '0',
          borderRadius: '4px',
          backgroundColor: 'var(--surface)',
          color: 'var(--on-surface)'
        }),
        group([
          animate('500ms linear', style({transform: 'translateX(0%)'})),
          sequence([
            animate('250ms linear', style({backgroundColor: 'var(--primary)', color: 'var(--on-primary)'})),
            animate('250ms linear', style({backgroundColor: 'var(--surface)', color: 'var(--on-surface)'}))
          ])
        ])
      ]),
      transition(':leave', [
        style({
          transform: 'translateX(0%)',
          border: '1px solid var(--outline)',
          borderRadius: '4px',
        }),
        group([
          animate('500ms linear', style({transform: 'translateX(100%)'})),
          sequence([
            animate('250ms linear', style({backgroundColor: 'var(--primary)', color: 'var(--on-primary)'})),
            animate('250ms linear', style({backgroundColor: 'var(--surface)', color: 'var(--on-surface)'}))
          ])
        ]),
        animate('1ms linear', style({
          transform: '',
          borderRadius: '',
          border: '',
          borderBottom: '',
          backgroundColor: '',
          color: '',
        })),
      ])
    ]),
    trigger('right-column', [
      transition(':enter', [
        style({
          transform: 'translateX(-100%)',
          border: '1px solid var(--outline)',
          borderTop: '0',
          borderRadius: '4px',
          backgroundColor: 'var(--surface)',
          color: 'var(--on-surface)'
        }),
        group([
          animate('500ms linear', style({transform: 'translateX(0%)'})),
          sequence([
            animate('250ms linear', style({backgroundColor: 'var(--primary)', color: 'var(--on-primary)'})),
            animate('250ms linear', style({backgroundColor: 'var(--surface)', color: 'var(--on-surface)'}))
          ])
        ])
      ]),
      transition(':leave', [
        style({
          transform: 'translateX(0%)',
          border: '1px solid var(--outline)',
          borderRadius: '4px'
        }),
        group([
          animate('500ms linear', style({transform: 'translateX(-100%)'})),
          sequence([
            animate('250ms linear', style({backgroundColor: 'var(--primary)', color: 'var(--on-primary)'})),
            animate('250ms linear', style({backgroundColor: 'var(--surface)', color: 'var(--on-surface)'}))
          ])
        ]),
        animate('1ms linear', style({
          transform: '',
          borderRadius: '',
          border: '',
          borderBottom: '',
          backgroundColor: '',
          color: '',
        })),
      ])
    ]),
  ]
})
export class TissueAnalysisComponent {
  close = output<{ status: 'finished' | 'premature' }>()

  summaries = computed(() => this.tissue.summaries.value()?.summaries || [])
  experiment = linkedSignal(() => this.summaries().at(0))

  tissuesMap = computed(() => this.experiment()?.tissuesMap || {})
  availableTissues = linkedSignal(() => Object.keys(this.tissuesMap()).sort())
  selectedTissues = linkedSignal<string[]>(() => this.tissuesMap() && [])


  lottieCanvas = viewChild<ElementRef<HTMLCanvasElement>>('lottie')
  theme = computed(() => this.darkService.isDark() ? 'dark' : 'light')


  selectTissuesControl: FormControl

  constructor(
    public tissue: TissueExperimentService,
    private analysis: AnalysisService,
    private state: UrlStateService,
    private lottieService: LottieService,
    private fb: FormBuilder,
    private darkService: DarkService,
  ) {
    this.selectTissuesControl = this.fb.nonNullable.control([] as string[], selected => selected.getRawValue().length === 0 ? {invalid: true} : null)
    effect(() => this.selectTissuesControl.setValue(this.selectedTissues()));

    effect(async () => {
      if (!this.lottieCanvas()) return;
      this.lottie = await this.lottieService.buildLottie({
        autoplay: true,
        loop: true,
        canvas: this.lottieCanvas()!.nativeElement,
        src: `assets/animations/${this.theme()}/loader-animation.json`
      })
    });
  }

  interval = signal<ReturnType<typeof setInterval> | undefined>(undefined);
  animate = signal(true)

  addOne() {
    const availableTissues = this.availableTissues();
    const shift = availableTissues.shift();
    if (shift) {
      this.availableTissues.set([...availableTissues]);
      this.selectedTissues.set([...this.selectedTissues(), shift]);
    } else if (this.interval) {
      clearInterval(this.interval());
      this.interval.set(undefined);
    }
  }

  removeOne() {
    const selectedTissues = this.selectedTissues();
    const shift = selectedTissues.shift();
    if (shift) {
      this.selectedTissues.set([...selectedTissues]);
      this.availableTissues.set([...this.availableTissues(), shift]);
    } else if (this.interval) {
      clearInterval(this.interval());
      this.interval.set(undefined);
    }
  }

  addAll() {
    this.interval.set(setInterval(() => this.addOne(), 20)) // stagger
  }

  removeAll() {
    this.interval.set(setInterval(() => this.removeOne(), 20)) // stagger
  }

  moveRight(tissue: string) {
    const from = this.availableTissues();
    const i = from.indexOf(tissue);
    from.splice(i, 1);
    this.availableTissues.set([...from]);

    const to = this.selectedTissues();
    to.splice(Math.min(i, to.length), 0, tissue);
    this.selectedTissues.set([...to]);
  }

  moveLeft(tissue: string) {
    const from = this.selectedTissues();
    const i = from.indexOf(tissue);
    from.splice(i, 1);
    this.selectedTissues.set([...from]);

    const to = this.availableTissues();
    to.splice(Math.min(i, to.length), 0, tissue);
    this.availableTissues.set([...to]);
  }

  tooltip(summary: Summary) {
    return `${summary.description} - ${summary.numberOfGenes} Genes - ${summary.timestamp} `
  }

  drop(event: CdkDragDrop<string[]>) {
    this.animate.set(false)
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );
    }
    setTimeout(() => this.animate.set(true))
  }

  lottie?: DotLottie;
  analysisLaunched = false
  token: string | null = null;

  analyse() {
    this.lottie?.load({src: `assets/animations/${this.theme()}/loader-animation.json`, loop: true, autoplay: true})
    this.analysisLaunched = true;
    this.analysis.analyseFromUrl(this.tissue.getSampleURL(this.experiment()!.id, {
      omitNulls: true,
      columns: this.selectedTissues().map(tissue => this.tissuesMap()[tissue])
    })).subscribe((result) => {
      this.lottie!.load({src: `assets/animations/${this.theme()}/loader-animation.json`, loop: true, autoplay: true})
      this.token = result.summary.token;
      this.close.emit({status: 'finished'})
    })
  }

  loadAnalysis() {
    this.state.analysis.set(this.token);
    this.close.emit({status: 'finished'});
  }


  protected readonly Math = Math;


}
