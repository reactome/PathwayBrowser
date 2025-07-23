import {Component, output} from '@angular/core';

@Component({
  selector: 'cr-compare-form',
  imports: [],
  templateUrl: './compare-form.component.html',
  styleUrl: './compare-form.component.scss'
})
export class CompareFormComponent {
  close = output<{ status: 'finished' | 'premature' }>()

}
