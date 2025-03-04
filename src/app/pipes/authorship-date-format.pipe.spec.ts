import {AuthorshipDateFormatPipe} from './authorship-date-format.pipe';
import {TestBed} from "@angular/core/testing";
import {DomSanitizer} from "@angular/platform-browser";

describe('AuthorshipDateFormatPipe', () => {
  let pipe: AuthorshipDateFormatPipe;

  beforeAll(() => {
    TestBed.configureTestingModule({providers: [AuthorshipDateFormatPipe, DomSanitizer]})
    pipe = TestBed.inject(AuthorshipDateFormatPipe)
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });
});
