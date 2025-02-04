import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  standalone: true,
  name: 'authorshipNameFormat'
})
export class AuthorshipNameFormatPipe implements PipeTransform {


  transform(displayName: string) {
    if (!displayName) return;

    const regex = /^(.*), (\d{4})-(\d{2})-(\d{2})$/;
    const match = displayName.match(regex);

    if (match) {
      // Replace commas with a space
      let name = displayName.replace(/,/g, ' ').trim();
      // Remove the date at the end (in format YYYY-MM-DD)
      name = name.replace(/\s*\d{4}-\d{2}-\d{2}$/, '');
      // Remove any extra spaces between name parts
      name = name.replace(/\s+/g, ' '); // Replaces multiple spaces with one

      return `${name}`;
    }

    return `${displayName}`;
  }

}
