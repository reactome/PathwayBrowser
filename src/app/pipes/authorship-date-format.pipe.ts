import {Pipe, PipeTransform} from '@angular/core';
import {DatePipe} from "@angular/common";

@Pipe({
  name: 'authorshipDateFormat',
  standalone: true
})
export class AuthorshipDateFormatPipe implements PipeTransform {
  constructor(private datePipe: DatePipe) {
  }

  transform(dateTime: string) {
    if (!dateTime) return;
    return this.datePipe.transform(dateTime, 'dd/MM/yyyy');
  }

}
