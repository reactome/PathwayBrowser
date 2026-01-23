import {TestBed} from '@angular/core/testing';

import {DiagramService} from './diagram.service';
import { HttpClient, provideHttpClient, withInterceptorsFromDi } from "@angular/common/http";
import {concatMap, delay, from, interval, tap, zip} from "rxjs";

describe('DiagramService', () => {
  let service: DiagramService;
  let client: HttpClient;

  beforeEach(() => {
    TestBed.configureTestingModule({
    teardown: { destroyAfterEach: false },
    imports: [],
    providers: [provideHttpClient(withInterceptorsFromDi())]
});
    service = TestBed.inject(DiagramService);
    client = TestBed.inject(HttpClient);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it("shouldn't have too small edge to be rendered", () => {
    zip(
      interval(50),
      client.get('/assets/data/diagrams-prod.txt', {responseType: "text"}).pipe(
        concatMap(ids => from(ids.split('\n').filter(s => s.length !== 0)))
      )
    ).pipe(
      tap(([_, id]) => service.getDiagram(id).subscribe()),
    ).subscribe();
  })
});
