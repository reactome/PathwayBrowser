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

      if (propA == null && propB == null) return 0; // Both null/undefined, treat as equal
      if (propA == null) return 1; // Move null/undefined to the end
      if (propB == null) return -1;

      const comparison = propA > propB ? 1 : propA < propB ? -1 : 0;
      return descending ? -comparison : comparison;
    })

  }

}
