import { Component } from '@angular/core';
import {MatProgressSpinner} from "@angular/material/progress-spinner";
import {MatDialogContent, MatDialogTitle} from "@angular/material/dialog";

@Component({
  selector: 'cr-blocking-loader',
  imports: [
    MatProgressSpinner,
    MatDialogContent
  ],
  templateUrl: './blocking-loader.component.html',
  styleUrl: './blocking-loader.component.scss'
})
export class BlockingLoaderComponent {

}
