import {Component, Input} from '@angular/core';
import {Event} from "../../model/event.model";
import {Analysis} from "../../model/analysis.model";
import {environment} from "../../../environments/environment";


@Component({
  selector: 'cr-details',
  templateUrl: './details.component.html',
  styleUrl: './details.component.scss'
})
export class DetailsComponent {

  @Input('event') event?: Event;
  @Input('analysisResult') analysisResult?: Analysis.Result;


  iconMap: { [key: string]: { icon: string, tooltip: string } } = {
    Pathway: { icon: 'pathway', tooltip: 'Reaction' },
    Reaction: { icon: 'reaction', tooltip: 'Reaction' },
    BlackBoxEvent: { icon: 'transition', tooltip: 'Black Box Event' }
  };


  OpenDetailsPage(stId: string) {
    const url = `${environment}/content/detail/${stId}`;
    window.open(url, '_blank');
  }
}
