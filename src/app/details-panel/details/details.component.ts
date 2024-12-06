import {Component, Input} from '@angular/core';
import {Event} from "../../model/event.model";
import {Analysis} from "../../model/analysis.model";

@Component({
  selector: 'cr-details',
  templateUrl: './details.component.html',
  styleUrl: './details.component.scss'
})
export class DetailsComponent {

  @Input('event') event?: Event;
  @Input('analysisResult') analysisResult?: Analysis.Result;
}
