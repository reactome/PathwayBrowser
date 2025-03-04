import {ScientificNumberPipe} from './scientific-number.pipe';
import {TestBed} from "@angular/core/testing";
import {DomSanitizer} from "@angular/platform-browser";

describe('ScientificNumberPipe', () => {
  let pipe: ScientificNumberPipe;

  beforeAll(() => {
    TestBed.configureTestingModule({providers: [ScientificNumberPipe, DomSanitizer]})
    pipe = TestBed.inject(ScientificNumberPipe)
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });
});
