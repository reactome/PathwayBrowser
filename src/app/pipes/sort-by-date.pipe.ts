import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'sortByDate',
  standalone: true
})
export class SortByDatePipe implements PipeTransform {

  transform<T>(value: T[], property: keyof T, descending: boolean = true) {
    if (!value || !property) return;

    return value.sort((a, b) => {
      const propA = a[property];
      const propB = b[property];

      if (propA === undefined && propB === undefined) return 0;
      if (propA === undefined) return 1;
      if (propB === undefined) return -1;
      if(!propA || !propB) return 0;

      const comparison = propA > propB ? 1 : propA <propB ? -1 : 0;
      return descending ? -comparison : comparison;

    })


  }

}
