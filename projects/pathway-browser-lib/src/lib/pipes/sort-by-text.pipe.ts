import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'sortByText',
  standalone: true
})
export class SortByTextPipe implements PipeTransform {
  // alphabetical sorting by default, sortByText :'databaseName':'desc'
  transform<T>(array: T[], key: keyof T, order: 'asc' | 'desc' = 'asc'): T[] {
    if (!array || !key) return array;

    return [...array].sort((a, b) => {
      const valueA = String(a[key]);
      const valueB = String(b[key]);
      return order === 'asc' ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA)
    })
  }

}
