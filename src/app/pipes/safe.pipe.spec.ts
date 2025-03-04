import {SafePipe} from './safe.pipe';
import {TestBed} from "@angular/core/testing";
import {DomSanitizer} from "@angular/platform-browser";

describe('SafePipe', () => {

  let pipe: SafePipe;

  beforeAll(() => {
    TestBed.configureTestingModule({providers: [SafePipe, DomSanitizer]})
    pipe = TestBed.inject(SafePipe)
  });


  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });
});
