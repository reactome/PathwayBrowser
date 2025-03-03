import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  standalone: true,
  name: 'extractCompartment'
})
export class ExtractCompartmentPipe implements PipeTransform {

  // Get compartment name from string
  // Substrates for chaperone mediated autophagy [cytosol] => cytosol
  transform(value: string): string | null {
    if (!value) return null;

    const match = value.match(/\[(.*?)\]/);
    return match ? match[1] : null;
  }

}
