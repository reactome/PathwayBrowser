import {Injectable, signal} from '@angular/core';


@Injectable({
  providedIn: 'root'
})
export class StructureService {

  //todo: move structure logic here?
  hasAnyStructure = signal<boolean>(true);

  constructor() {}

}
