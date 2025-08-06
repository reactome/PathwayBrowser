import {Component, computed, input} from '@angular/core';
import {UrlStateService} from "../../../services/url-state.service";
import {MatIconButton} from "@angular/material/button";
import {MatIcon} from "@angular/material/icon";

@Component({
  selector: 'cr-flag-button',
  imports: [
    MatIconButton,
    MatIcon
  ],
  templateUrl: './flag-button.component.html',
  styleUrl: './flag-button.component.scss'
})
export class FlagButtonComponent {
  id = input.required<string>()
  flagged = computed(() => this.state.flag().includes(this.id()))
  size = input(40)
  touchSize = input(48)

  constructor(public state: UrlStateService) {
  }

  toggle(): void {
    if (!this.flagged()) {
      this.state.flag.set([...this.state.flag(), this.id()]);
    } else {
      this.state.flag.set(this.state.flag().filter(i => i !== this.id()));
    }
  }

}
