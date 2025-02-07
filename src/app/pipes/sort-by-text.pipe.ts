import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'sortByText',
  standalone: true
})
export class SortByTextPipe implements PipeTransform {
  // alphabetical sorting by default, sortByText :'databaseName':'desc'
  transform<T>(array: T[], key: keyof T, order: 'asc' | 'desc' = 'asc'): T[] {
    if (!array || !key) return array;

    return array.slice().sort((a, b) => {
      const valueA = a[key] as string;
      const valueB = b[key] as string;
      return order === 'asc' ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA)
    })
  }

}
