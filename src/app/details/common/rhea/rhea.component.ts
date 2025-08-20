import {Component, computed, effect, input} from '@angular/core';
import {DatabaseIdentifier} from "../../../model/graph/database-identifier.model";
import {rxResource} from "@angular/core/rxjs-interop";
import {RheaService} from "../../../services/rhea.service";
import {forkJoin, map} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {SafePipe} from "../../../pipes/safe.pipe";

@Component({
  selector: 'cr-rhea',
  imports: [
    SafePipe
  ],
  templateUrl: './rhea.component.html',
  styleUrl: './rhea.component.scss'
})
export class RheaComponent {

  readonly _xRefs = input.required<DatabaseIdentifier[]>({alias: 'crossRefs'});

  constructor(private rheaService: RheaService,
              private http: HttpClient) {

    effect(() => {
      console.log('resource ', this.rheaResources())
    });

  }

  _rheaResources = rxResource({
    request: () => this._xRefs(),
    loader: (params) => {

      const identifiers= params.request;

      /*
       Remove duplicated object in the list when they have same identifier
       */
      const unique = new Set<string>();
      const xRefs = identifiers.filter(i => {
        if (unique.has(i.identifier)) return false;
        unique.add(i.identifier);
        return true;
      })

      return forkJoin((
        xRefs.map(xRef => this.rheaService.getRheaJson(xRef))
      ))
    }
  })

  rheaResources = computed(() =>this._rheaResources.value());

  _structureSVGs = rxResource({
    request: () => this.allParticipantStructures() || [],
    loader: (params) => {
      const participants = params.request;
      return forkJoin((
        participants.map(participant => this.http.get(`https://www.rhea-db.org/chebi/${participant.id}`, {responseType: 'text'}).pipe(
            map(result => [participant.id, result] as unknown as [number, string | undefined])
          )
        )
      )).pipe(
        map(entries => new Map(entries)) // Transform to Map [id, result] from tuple arrays
      )
    }
  })


  allParticipantStructures = computed(() => {
    return this.rheaResources()?.flatMap(rheaJson => rheaJson.participants);
  })


  structuredSVGs = computed(() => this._structureSVGs.value() || new Map<number, string | undefined>());


}
