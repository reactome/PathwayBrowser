import {Injectable, Pipe, PipeTransform} from '@angular/core';

@Injectable({ providedIn: 'root' })
@Pipe({
  standalone: true,
  name: 'extractCompartment'
})
export class ExtractCompartmentPipe implements PipeTransform {

  // Get compartment name from string when remove is false, and get displayName when return is true
  // DisplayName result from backend: RTC [double membrane vesicle viral factory outer membrane]
  // True: RTC, False: double membrane vesicle viral factory outer membrane
  transform(value: string, remove = false): string | null {
    if (!value) return null;

    if (remove) return value.split('[')[0]

    const match = value.match(/\[(.*?)\]/);
    return match ? match[1] : null;
  }

}
