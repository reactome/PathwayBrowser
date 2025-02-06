import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  standalone: true,
  name: 'removeProteinName'
})
export class RemoveProteinNamePipe implements PipeTransform {

  transform(value: string) {
    if (!value) return value;
    const lastSpaceIndex = value.lastIndexOf(' ');
    return lastSpaceIndex !== -1 ? value.substring(0, lastSpaceIndex) : value;
  }

}
