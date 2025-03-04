import {Inject, LOCALE_ID, Pipe, PipeTransform} from '@angular/core';
import {DatePipe} from "@angular/common";

@Pipe({
  name: 'authorshipDateFormat',
  standalone: true
})
export class AuthorshipDateFormatPipe implements PipeTransform {
  constructor(private datePipe: DatePipe, @Inject(LOCALE_ID) private locale: string) {
  }

  transform(dateTime: string) {
    if (!dateTime) return;
    return this.datePipe.transform(dateTime);
  }

}
