import {
  AfterViewInit,
  Component,
  computed,
  effect,
  ElementRef, input,
  output,
  signal,
  viewChild,
  WritableSignal
} from '@angular/core';
import {MatStep, MatStepLabel, MatStepper, MatStepperNext, MatStepperPrevious} from "@angular/material/stepper";
import {MatButton} from "@angular/material/button";
import {MatIconModule} from "@angular/material/icon";
import {ReactomeTableModule, Settings, TableComponent} from "reactome-table";
import {HttpClient} from "@angular/common/http";
import {FormControl, ReactiveFormsModule} from "@angular/forms";
import {UntilDestroy, untilDestroyed} from "@ngneat/until-destroy";
import {map, switchMap, take} from "rxjs";
import {AsyncPipe} from "@angular/common";
import {SafePipe} from "../../../pipes/safe.pipe";
import {AnalysisService} from "../../../services/analysis.service";
import type {DotLottie} from "@lottiefiles/dotlottie-web";
import {UrlStateService} from "../../../services/url-state.service";
import {LottieService} from "../../../services/lottie.service";
import {DarkService} from "../../../services/dark.service";


@UntilDestroy()
@Component({
  selector: 'cr-qualitative-analysis',
  imports: [
    MatStepper,
    MatStep,
    MatStepLabel,
    MatButton,
    MatIconModule,
    MatStepperNext,
    MatStepperPrevious,
    ReactomeTableModule,
    ReactiveFormsModule,
    AsyncPipe,
    SafePipe,
  ],
  templateUrl: './qualitative-analysis.component.html',
  styleUrl: './qualitative-analysis.component.scss'
})
export class QualitativeAnalysisComponent implements AfterViewInit {
  close = output<{ status: 'finished' | 'premature' }>()
  status = input.required<'open' | 'closed'>()

  table = viewChild<TableComponent>('table')
  data = signal<string[][]>([['']])
  theme = computed(() => this.darkService.isDark() ? 'dark' : 'light')

  settings: Partial<Settings> = {
    renameCols: true,
    renameRows: false,
    addRow: false,
    addColumn: true,
    deleteRow: false,
    deleteCol: false,

    importMapHeaders: false,

    uploadButton: false,
    downloadButton: false,
  }

  loadExample(exampleId: string) {
    this.http.get(`assets/data/analysis-examples/${exampleId}.tsv`, {responseType: 'text'}).subscribe(
      (res) => {
        this.table()!.importFileContent({content: res, type: 'tsv'}, true);
      })
  }

  dataStepForm = new FormControl(null);
  interactorsIllustrationCanvas = viewChild<ElementRef<HTMLCanvasElement>>('interactorsIllustration')
  interactorsIllustrationLottie?: DotLottie;

  constructor(
    private http: HttpClient,
    public analysis: AnalysisService,
    private state: UrlStateService,
    private lottieService: LottieService,
    private darkService: DarkService,
  ) {
    effect(async () => {
      if (!this.interactorsIllustrationCanvas() || this.interactorsIllustrationLottie !== undefined) return;
      this.interactorsIllustrationLottie = await this.lottieService.buildLottie({
        renderConfig: {
          autoResize: true,
          freezeOnOffscreen: true
        },
        autoplay: false,
        loop: true,
        canvas: this.interactorsIllustrationCanvas()!.nativeElement,
        src: "assets/animations/light/interactors-animation.json"
      })

    });
    effect(async () => {
      if (!this.lottieCanvas() || this.lottieEnd !== undefined) return;
      console.log('Building lottie')
      this.lottieEnd = await this.lottieService.buildLottie({
        renderConfig: {
          autoResize: true,
          freezeOnOffscreen: true
        },
        autoplay: true,
        loop: true,
        canvas: this.lottieCanvas()!.nativeElement,
        src: `assets/animations/${this.theme()}/loader-animation.json`
      })
    });
    effect(() => {
      const [theme, analysisLaunched, analysisAvailable] = [this.theme(), this.analysisLaunched(), this.analysisAvailable()];
      if (analysisLaunched && this.lottieEnd) {
        this.lottieEnd.load({
          src: `assets/animations/${theme}/${analysisAvailable ? 'success' : 'loader'}-animation.json`,
          loop: !analysisAvailable,
          autoplay: true
        })
      }
    });

    effect(() => {
      if (this.status() === 'open' && this.lottieEnd) setTimeout(() => this.lottieEnd!.play(), 800);
    });

    effect(() => {
      const theme = this.theme();
      if (this.interactorsIllustrationLottie) this.interactorsIllustrationLottie.load({
        src: `assets/animations/${theme}/interactors-animation.json`,
        loop: true,
        autoplay: false
      })
    })

  }

  ngAfterViewInit(): void {
    this.dataStepForm.setAsyncValidators(control => this.table()!.hasData$.pipe(
      map(hasData => hasData ? null : {invalid: true}),
      untilDestroyed(this)
    ))
    this.dataStepForm.updateValueAndValidity()
  }

  uploadFile(input: HTMLInputElement) {
    const file = input?.files?.[0];
    if (file) this.table()!.importFile(file, true)
  }

  downloadFile() {
    this.table()!.exportFile();
  }


  // STEP 2 Options

  readonly projectToHuman = signal(true)
  readonly includeInteractors = signal(false)

  toggle(booleanSignal: WritableSignal<boolean>) {
    booleanSignal.set(!booleanSignal());
  }

  projectToHumanIllustration = this.http.get('assets/animations/orthology-animation.svg', {responseType: 'text'})

  // STEP 3 Analysis
  analysisLaunched = signal(false)
  analysisAvailable = signal(false)
  lottieCanvas = viewChild<ElementRef<HTMLCanvasElement>>('lottie')
  lottieEnd?: DotLottie;
  token: string | null = null;

  async launchAnalysis() {
    this.analysisLaunched.set(true)
    this.analysisAvailable.set(false)
    this.table()!.cleanData$.pipe(
      take(1),
      switchMap(data => this.analysis.analyse(data.map(row => row.join('\t')).join('\n'), {
          projectToHuman: this.projectToHuman(),
          interactors: this.includeInteractors()
        })
      )
    ).subscribe((result) => {
      this.analysisAvailable.set(true)
      this.token = result.summary.token;
      this.close.emit({status: 'finished'})
    });
  }

  displayAnalysis() {
    this.state.analysis.set(this.token!)
    this.close.emit({status: 'finished'})
  }

  protected readonly Math = Math;
}
