import {Component, output} from '@angular/core';
import {MatStep, MatStepLabel, MatStepper, MatStepperNext, MatStepperPrevious} from "@angular/material/stepper";
import {MatButton} from "@angular/material/button";
import {MatIconModule} from "@angular/material/icon";
import {ReactomeTableModule, Settings, Subset} from "reactome-table";

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
    ReactomeTableModule
  ],
  templateUrl: './qualitative-analysis.component.html',
  styleUrl: './qualitative-analysis.component.scss'
})
export class QualitativeAnalysisComponent {
  close = output<{ status: 'finished' | 'premature' }>()

  data: string[][] = range(0, 50).map(((row, i) =>
    range(0, 50).map(((col, j) =>
        i === 0 ?
          j === 0 ?
            '' :
            `${j}` :
          j === 0 ?
            `${i}` :
            ``
    )))
  );

  settings: Subset<Settings> = {
    renameCols: false,
    renameRows: false,
    addRow: false,
    addCol: false,

    uploadButton: false,
    downloadButton: false,
  }


}

function range(from: number, to: number) {
  return new Array(to - from).fill(0).map((_, i) => from + i);
}
