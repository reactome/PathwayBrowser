import {Component, input, OnInit} from '@angular/core';
@Component({
  selector: 'cr-logger',
  imports: [],
  template: ''
})
export class LoggerComponent implements OnInit{
  toLog = input<any>()

  constructor() {
  }

  ngOnInit(): void {
    console.log('Building ',  this.toLog())
  }


}
