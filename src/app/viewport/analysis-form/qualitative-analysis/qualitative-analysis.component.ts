import {AfterViewInit, Component, output, signal, viewChild, WritableSignal} from '@angular/core';
import {MatStep, MatStepLabel, MatStepper, MatStepperNext, MatStepperPrevious} from "@angular/material/stepper";
import {MatButton} from "@angular/material/button";
import {MatIconModule} from "@angular/material/icon";
import {ReactomeTableModule, Settings, TableComponent} from "reactome-table";
import {HttpClient} from "@angular/common/http";
import {FormBuilder, FormGroup, ReactiveFormsModule} from "@angular/forms";
import {UntilDestroy, untilDestroyed} from "@ngneat/until-destroy";
import {map, switchMap, take, tap} from "rxjs";
import {AsyncPipe, NgOptimizedImage} from "@angular/common";
import {rxResource} from "@angular/core/rxjs-interop";
import {SafePipe} from "../../../pipes/safe.pipe";
import {MatProgressSpinner} from "@angular/material/progress-spinner";
import {AnalysisService} from "../../../services/analysis.service";

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
  table = viewChild<TableComponent>('table')
  data = signal<string[][]>([['']])

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

  dataStepForm: FormGroup;

  constructor(private http: HttpClient, private fb: FormBuilder, public analysis: AnalysisService) {
    this.dataStepForm = this.fb.group({
      data: [''],
    })
  }

  ngAfterViewInit(): void {
    const control = this.dataStepForm.get('data')!;
    control.setAsyncValidators(ctrl => this.table()!.hasData$.pipe(
      map(hasData => hasData ? null : {invalid: true}),
      untilDestroyed(this)
    ))
    control.updateValueAndValidity()

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
  includeInteractorsIllustration = this.http.get('assets/animations/interactors-animation.svg', {responseType: 'text'})

  // STEP 3 Analysis
  analysisRunning = signal(false)

  launchAnalysis() {
    this.analysisRunning.set(true)
    this.table()!.cleanData$.pipe(
      take(1),
      switchMap(data => this.analysis.analyse(data.map(row => row.join('\t')).join('\n'), {
        projectToHuman: this.projectToHuman(),
        interactors: this.includeInteractors()
      })
      )
    ).subscribe(() => {
      this.analysisRunning.set(false)
      this.close.emit({status: 'finished'})
    });

  }
}
